import time
import uuid
import logging
from typing import Optional
from pathlib import Path
from datetime import datetime
from ..ingestion.base import BaseIngestor
from ..ingestion.auth_lanl import LanlAuthIngestor
from ..ingestion.net_cicids import CicIdsIngestor
from ..processing.normalizer import Normalizer
from ..processing.enricher import Enricher
from ..storage.writer import StorageWriter
from ..core.schema import CanonicalEvent, RejectionEvent, RejectionReason, EventType
from ..core.config import settings
from ..core.exceptions import SchemaValidationError, RateLimitExceeded
import json
import os

logger = logging.getLogger(__name__)

class Pipeline:
    """
    Orchestrates the flow: Ingest -> Normalize -> Enrich -> Validate -> Storage.
    Includes Rate Limiting Defense and strict DLQ.
    """

    def __init__(self, ingestor: BaseIngestor):
        self.ingestor = ingestor
        self.normalizer = Normalizer()
        self.enricher = Enricher()
        self.writer = StorageWriter()
        
        # Rate Limiting (Token Bucket)
        self.rate_limit = settings.MAX_INGEST_RATE
        self.tokens = self.rate_limit
        self.last_refill = time.time()
        
        # Tracking
        self.previous_event_hash: Optional[str] = None

    def _check_rate_limit(self):
        """
        Simple Token Bucket implementation for Ingestion Rate Defense.
        """
        now = time.time()
        elapsed = now - self.last_refill
        
        # Refill tokens
        self.tokens = min(self.rate_limit, self.tokens + elapsed * self.rate_limit)
        self.last_refill = now
        
        if self.tokens < 1:
            raise RateLimitExceeded("Ingestion rate limit exceeded.")
        
        self.tokens -= 1

    def _map_semantic_type(self, raw_type: str, success_status: str) -> str:
        """
        Maps raw log types to semantic EventType.
        """
        raw_lower = raw_type.lower()
        status_lower = str(success_status).lower()
        
        if "logon" in raw_lower:
            if "success" in status_lower:
                return EventType.AuthSuccess.value
            return EventType.AuthFailure.value
        if "network" in raw_lower:
            return EventType.NetworkConnect.value
        
        return EventType.Unknown.value

    def run(self):
        logger.info(f"Starting pipeline for {self.ingestor.file_path}")
        count_success = 0
        count_fail = 0
        type_counts = {}
        
        try:
            for raw_dict in self.ingestor.ingest():
                try:
                    # 1. Rate Defense
                    self._check_rate_limit()
                    
                    # 2. Extract Raw Source (for hash/audit)
                    raw_source = str(raw_dict)
                    
                    # 3. Normalize & Clean
                    raw_auth_type = raw_dict.get('auth_type') or raw_dict.get('Label') or "Unknown"
                    success_status = raw_dict.get('success_failure') or "Unknown"
                    
                    # Semantic Mapping
                    semantic_event_type = self._map_semantic_type(str(raw_auth_type), str(success_status))
                    type_counts[semantic_event_type] = type_counts.get(semantic_event_type, 0) + 1
                    
                    # Timestamp Norm
                    raw_time = raw_dict.get('time') or raw_dict.get('Timestamp')
                    timestamp = self.normalizer.normalize_timestamp(raw_time)
                    
                    normalized_data = {
                        "event_id": str(uuid.uuid4()),
                        "timestamp": timestamp,
                        "event_type": semantic_event_type, # Semantic
                        "source_host": self.normalizer.normalize_host(raw_dict.get('source_host') or raw_dict.get('Source IP') or raw_dict.get('source_computer')),
                        "target_host": self.normalizer.normalize_host(raw_dict.get('dest_host') or raw_dict.get('Destination IP') or raw_dict.get('dest_computer')),
                        "user": self.normalizer.normalize_user(raw_dict.get('source_user') or raw_dict.get('source_user@domain')),
                        
                        # Protocol Separation
                        "protocol": str(raw_auth_type) if raw_auth_type not in ["?", "Unknown"] else "UNKNOWN",
                        "port": int(raw_dict['dest_port']) if raw_dict.get('dest_port') else None,
                        
                        # Interim values
                        "mitre_technique": None,
                        "confidence_score": 0.0,
                        "data_quality_score": 0.0,
                        "raw_source": raw_source,
                        "ingest_timestamp": datetime.utcnow(),
                        "source_file": str(self.ingestor.file_path),
                        "parser_version": self.ingestor.parser_version,
                        "model_version": "init",
                        "raw_hash": "", 
                        "event_hash": "",
                    }
                    
                    # 4. Enrich
                    # Pass specific context for MITRE
                    enrich_text = f"{semantic_event_type} via {normalized_data['protocol']} by {normalized_data['user']}"
                    if semantic_event_type == EventType.AuthFailure.value:
                        enrich_text += " authentication failure brute force"
                    
                    normalized_data = self.enricher.enrich(normalized_data, enrich_text)
                    
                    # 5. Create Canonical Event
                    import hashlib
                    normalized_data['raw_hash'] = hashlib.sha256(raw_source.encode('utf-8')).hexdigest()
                    
                    event = CanonicalEvent(**normalized_data)
                    
                    # 6. Integrity & Chaining
                    event = event.compute_hashes(self.previous_event_hash)
                    self.previous_event_hash = event.event_hash
                    
                    # 7. Write
                    self.writer.write(event)
                    count_success += 1
                    
                except Exception as e:
                    # 🔴 AUDIT BLOCKER FIX: HARD WRITES TO DLQ
                    reason = RejectionReason.UNKNOWN
                    if isinstance(e, RateLimitExceeded): reason = RejectionReason.INTEGRITY_FAILURE
                    elif "validation" in str(e).lower(): reason = RejectionReason.SCHEMA_VIOLATION
                    
                    dlq_event = RejectionEvent(
                        rejection_reason=reason,
                        raw_source=str(raw_dict),
                        source_file=str(self.ingestor.file_path),
                        parser_version=self.ingestor.parser_version,
                        error_message=str(e)
                    )
                    self.writer.write_dlq_strict(dlq_event)
                    count_fail += 1
                    
                    # Log but continue
                    logger.warning(f"Event rejected: {e}")

            # Final flush
            self.writer.flush()
            logger.info(f"Pipeline finished. Success: {count_success}, Failed: {count_fail}")
            
            # Dump Stats for UI
            summary = {
                "total_events": count_success + count_fail,
                "success": count_success,
                "failed": count_fail,
                "by_type": type_counts,
                "source_file": str(self.ingestor.file_path)
            }
            try:
                # Save to Tool1 root
                with open("ingestion_summary.json", "w") as f:
                    json.dump(summary, f, indent=2)
            except Exception as e:
                logger.error(f"Failed to write summary: {e}")
            
        except Exception as e:
            logger.critical(f"Pipeline crashed: {e}")
            raise e
