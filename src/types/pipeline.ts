// Pipeline state and types for PredictPath tools
export interface ToolOutput {
  tool: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  startTime?: Date;
  endTime?: Date;
  output?: any;
  error?: string;
  logs: string[];
}

export interface PipelineState {
  isRunning: boolean;
  currentTool: number;
  tools: ToolOutput[];
  inputFile: File | null;
  inputType: 'lanl' | 'cicids';
  backendUrl: string;
}

export interface Session {
  session_id: string;
  user: string;
  start_time: string;
  end_time: string;
  events: EnrichedEvent[];
  is_high_priority: boolean;
}

export interface EnrichedEvent {
  event_id: string;
  timestamp: string;
  user: string;
  source_host: string;
  target_host?: string;
  event_type: string;
  protocol?: string;
  mitre_technique?: string;
  confidence_score: number;
  data_quality_score: number;
}

export interface PathReport {
  session_id: string;
  root_cause_node: string;
  blast_radius: string[];
  path_anomaly_score: number;
  prediction_vector: PathPrediction[];
  generated_at: string;
}

export interface PathPrediction {
  next_node: string;
  probability: number;
}

export interface PredictedScenario {
  sequence: string[];
  probability: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  reaction_time_window: {
    min_seconds: number;
    max_seconds: number;
  };
  explainability: {
    positive_evidence: string[];
    negative_evidence: string[];
    uncertainty_factors: string[];
  };
}

export interface TrajectoryForecast {
  session_id: string;
  current_state: {
    observed_techniques: string[];
    host_scope: string[];
    graph_depth: number;
  };
  predicted_scenarios: PredictedScenario[];
  aggregate_confidence: number;
  model_version: string;
  suppression_reason?: string;
}

export interface ResponseDecision {
  session_id: string;
  decision_confidence: number;
  priority_rank: number;
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  recommended_actions: RecommendedAction[];
  rejected_actions: RejectedAction[];
  decision_explainability: {
    why_now: string;
    why_not_later: string;
    what_happens_if_ignored: string;
    correlation_context?: string;
  };
}

export interface RecommendedAction {
  action_type: string;
  target: {
    type: string;
    identifier: string;
  };
  recommended_within_seconds: number;
  justification: {
    predicted_scenarios: string[];
    risk_reduction: {
      absolute: number;
      relative: string;
    };
  };
}

export interface RejectedAction {
  candidate_action: string;
  rejection_reasons: string[];
}

export interface ExecutionResult {
  action_id: string;
  session_id: string;
  target: string;
  action_name: string;
  execution_mode: 'AUTO' | 'STAGED' | 'REJECTED';
  final_status: 'SUCCESS' | 'PENDING' | 'BLOCKED' | 'FAILED';
  executor: string;
  message: string;
  rollback_token?: string;
}

export interface ExecutionReport {
  executions: ExecutionResult[];
  summary_stats: {
    success: number;
    pending: number;
    blocked: number;
    failed: number;
    total: number;
  };
}

export interface SystemStatus {
  version_id: string;
  containment_threshold: number;
  disruptive_threshold: number;
  trust_momentum: number;
  success_streak: number;
  failure_streak: number;
  trend: 'stable' | 'tightening' | 'relaxing';
}

// MITRE ATT&CK technique names
export const MITRE_TECHNIQUES: Record<string, string> = {
  'T1078': 'Valid Accounts',
  'T1110': 'Brute Force',
  'T1046': 'Network Service Discovery',
  'T1021': 'Remote Services',
  'T1003': 'OS Credential Dumping',
  'T1560': 'Archive Collected Data',
  'T1041': 'Exfiltration Over C2',
  'T1558': 'Steal or Forge Kerberos Tickets',
  'T1550': 'Use Alternate Authentication Material',
  'T1059': 'Command and Scripting Interpreter',
  'T1190': 'Exploit Public-Facing Application',
  'T1486': 'Data Encrypted for Impact',
};

export function getTechniqueName(id: string): string {
  return MITRE_TECHNIQUES[id] || id;
}

export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical': return 'text-red-400';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-muted-foreground';
  }
}

export function getRiskBadgeVariant(level: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  switch (level.toLowerCase()) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'low': return 'low';
    default: return 'info';
  }
}
