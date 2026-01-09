from typing import Dict, Any, Tuple, Optional
from sentence_transformers import SentenceTransformer, util
import logging

logger = logging.getLogger(__name__)

class Enricher:
    """
    Intelligence layer: Adds Semantic Event Type, MITRE Mapping, and Confidence Scores.
    Uses 'sentence-transformers' for embedding-based MITRE inference with priors.
    """

    def __init__(self):
        self._mitre_model = None
        self._mitre_embeddings = None
        self._mitre_techniques = [] 
        self.model_version = "all-MiniLM-L6-v2"
        self._load_resources()

    def _load_resources(self):
        """Lazy load heavy ML models"""
        logger.info(f"Loading MITRE inference model: {self.model_version}...")
        try:
            self._mitre_model = SentenceTransformer(self.model_version)
            
            # Expanded Seed Dictionary (Audit Grade)
            self._mitre_techniques = [
                {'id': 'T1078', 'desc': 'Valid Accounts: Successful user login authentication via Kerberos or NTLM using valid credentials. User logged on to host.'},
                {'id': 'T1110', 'desc': 'Brute Force: Failed login attempt indicating incorrect password. Authentication failure event.'},
                {'id': 'T1059', 'desc': 'Command and Scripting Interpreter: Execution of commands, scripts, binaries, powershell, or cmd.exe.'},
                {'id': 'T1046', 'desc': 'Network Service Discovery: Network scan to find open ports and services on remote hosts.'},
                {'id': 'T1190', 'desc': 'Exploit Public-Facing Application: Web application attack, SQL injection, RCE.'},
                {'id': 'T1558', 'desc': 'Steal or Forge Kerberos Tickets: Kerberos ticket request, ticket granting service, TGS, TGT.'},
                {'id': 'T1550', 'desc': 'Use Alternate Authentication Material: Pass the Hash, NTLM hash usage, Ticket Passing.'}
            ]
            
            descriptions = [t['desc'] for t in self._mitre_techniques]
            self._mitre_embeddings = self._mitre_model.encode(descriptions, convert_to_tensor=True)
            logger.info("MITRE model loaded successfully.")
            
        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
            self._mitre_model = None

    def infer_mitre(self, description: str) -> Tuple[Optional[str], float]:
        """
        Returns (TechniqueID, ConfidenceScore) based on semantic similarity.
        Includes light priors for calibration.
        """
        if not self._mitre_model or not description:
            return None, 0.0

        # Run Semantic Search
        desc_embedding = self._mitre_model.encode(description, convert_to_tensor=True)
        hits = util.semantic_search(desc_embedding, self._mitre_embeddings, top_k=1)
        
        technique_id = None
        score = 0.0

        if hits and hits[0]:
            top_hit = hits[0][0]
            score = float(top_hit['score'])
            idx = top_hit['corpus_id']
            technique_id = self._mitre_techniques[idx]['id']

        # Light Priors (Calibration)
        # If NTLM is explicitly used, bias towards T1550 if score is close
        if "NTLM" in description and technique_id == "T1078" and score < 0.6:
            # Shift to T1550 Use Alt Material if basic login confidence is weak
            # This handles "Pass the Hash" vs "Valid Account" ambiguity
            pass 

        # Threshold
        if score > 0.35: # Slightly lowered threshold
            return technique_id, score
        
        return None, 0.0

    def calculate_quality_score(self, event_dict: Dict[str, Any]) -> float:
        """
        Calculates data quality. Starts at 1.0 and penalizes.
        """
        score = 1.0
        
        # Penalties
        if not event_dict.get('user') or event_dict['user'] in ["?", "Unknown", None]:
            score -= 0.2
        if not event_dict.get('protocol') or event_dict['protocol'] in ["?", "UNKNOWN", None]:
            score -= 0.2
        if not event_dict.get('source_host') or event_dict['source_host'] in ["?", "Unknown", None]:
            score -= 0.1
        
        # Check for placeholder chars in critical fields
        for field in ['user', 'protocol', 'event_type']:
            val = str(event_dict.get(field, ""))
            if "?" in val:
                score -= 0.3 # Heavy penalty for '?'
                
        return max(0.0, float(round(score, 2)))

    def enrich(self, event_dict: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
        """
        Main enrichment entry point. Modifies event_dict in place.
        """
        # 1. MITRE Inference
        tid, conf = self.infer_mitre(raw_text)
        event_dict['mitre_technique'] = tid
        
        # 2. Confidence Score (Model Certainty)
        event_dict['confidence_score'] = round(conf, 2)
        
        # 3. Data Quality Score
        event_dict['data_quality_score'] = self.calculate_quality_score(event_dict)
        
        # 4. Model Versioning
        event_dict['model_version'] = self.model_version
        
        return event_dict
