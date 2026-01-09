import polars as pl
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Union
from ..core.config import settings
from ..core.schema import CanonicalEvent, RejectionEvent
import logging
import json

logger = logging.getLogger(__name__)

class StorageWriter:
    """
    Handles writing CanonicalEvents to Parquet and Rejected Events to DLQ.
    Uses Polars for efficient columnar storage.
    """

    def __init__(self):
        self.output_dir = settings.OUTPUT_DIR
        self.dlq_dir = settings.DEAD_LETTER_QUEUE_DIR
        self.max_batch_size = 10000
        self._buffer: List[CanonicalEvent] = []

    def write(self, event: CanonicalEvent):
        """Add event to buffer and flush if full."""
        self._buffer.append(event)
        if len(self._buffer) >= self.max_batch_size:
            self.flush()

    def flush(self):
        """Write buffered events to Parquet partitioned by date."""
        if not self._buffer:
            return

        try:
            # Convert list of Pydantic models to Polars DataFrame
            dicts = [e.model_dump() for e in self._buffer]
            df = pl.DataFrame(dicts)

            # Add partition date column
            df = df.with_columns(
                pl.col("timestamp").dt.date().alias("date")
            )

            partitions = df.partition_by("date", as_dict=True)
            
            for date_key, part_df in partitions.items():
                date_val = date_key[0] if isinstance(date_key, tuple) else date_key
                filename = f"events_{date_val}_{datetime.utcnow().timestamp()}.parquet"
                path = self.output_dir / str(date_val) / filename
                path.parent.mkdir(parents=True, exist_ok=True)
                
                part_df.drop("date").write_parquet(path)
                logger.debug(f"Flushed {len(part_df)} events to {path}")

            self._buffer.clear()
            
        except Exception as e:
            logger.error(f"Failed to flush storage buffer: {e}")
            self._emergency_dump()

    def write_dlq_strict(self, event: RejectionEvent):
        """
        Hard write path for DLQ. Writes immediately to Parquet.
        """
        try:
            # Create a localized DLQ path
            date_str = event.ingest_timestamp.strftime("%Y-%m-%d")
            filename = f"rejected_{datetime.utcnow().timestamp()}.parquet"
            path = self.dlq_dir / date_str / filename
            path.parent.mkdir(parents=True, exist_ok=True)
            
            # Create DataFrame
            df = pl.DataFrame([event.model_dump()])
            df.write_parquet(path)
            
            logger.info(f"Rejected event persisted to DLQ: {path}")

        except Exception as e:
            logger.critical(f"FATAL: Failed to write to DLQ: {e} | Raw Data: {event.raw_source}")
            # Last resort fallback
            self._emergency_dlq_dump(event)

    def _emergency_dump(self):
        """Fallback if Parquet writing fails"""
        try:
             path = self.output_dir / f"emergency_dump_{datetime.utcnow().timestamp()}.jsonl"
             with open(path, "w") as f:
                 for e in self._buffer:
                     f.write(e.model_dump_json() + "\n")
             logger.warning(f"Emergency dump written to {path}")
             self._buffer.clear()
        except Exception:
            logger.error("CRITICAL: Emergency dump failed. Data loss occurring.")

    def _emergency_dlq_dump(self, event: RejectionEvent):
        try:
            path = self.dlq_dir / "PANIC_DLQ.jsonl"
            with open(path, "a") as f:
                f.write(event.model_dump_json() + "\n")
        except:
            pass # Cannot do anything more
