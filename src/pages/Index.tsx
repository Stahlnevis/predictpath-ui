import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/cockpit/FileUploader';
import { TerminalView } from '@/components/cockpit/TerminalView';
import { PipelineStatus } from '@/components/cockpit/PipelineStatus';
import { AttackGraph } from '@/components/cockpit/AttackGraph';
import { ResultsCharts } from '@/components/cockpit/ResultsCharts';
import { ResponseBoard } from '@/components/cockpit/ResponseBoard';
import { TrajectoryPanel } from '@/components/cockpit/TrajectoryPanel';
import { SystemStatusPanel } from '@/components/cockpit/SystemStatusPanel';
import { usePipelineStore } from '@/stores/pipelineStore';
import { Toaster } from '@/components/ui/sonner';
import { Play, Square, RotateCcw, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { PathReport, TrajectoryForecast, ResponseDecision, ExecutionReport, SystemStatus } from '@/types/pipeline';

// Demo data for visualization
const DEMO_PATH_REPORTS: PathReport[] = [
  {
    session_id: 'u001_session_1',
    root_cause_node: 'evt_001_auth',
    blast_radius: ['host-a', 'host-b', 'dc-01'],
    path_anomaly_score: 7.5,
    prediction_vector: [
      { next_node: 'Lateral Movement', probability: 0.6 },
      { next_node: 'Credential Access', probability: 0.3 },
      { next_node: 'Discovery', probability: 0.1 },
    ],
    generated_at: new Date().toISOString(),
  },
];

const DEMO_FORECASTS: TrajectoryForecast[] = [
  {
    session_id: 'u001_session_1',
    current_state: {
      observed_techniques: ['T1078', 'T1110'],
      host_scope: ['host-a', 'host-b'],
      graph_depth: 2,
    },
    predicted_scenarios: [
      {
        sequence: ['T1021', 'T1003', 'T1041'],
        probability: 0.65,
        risk_level: 'High',
        reaction_time_window: { min_seconds: 300, max_seconds: 3600 },
        explainability: {
          positive_evidence: ['Multiple hosts in blast radius enables lateral movement'],
          negative_evidence: [],
          uncertainty_factors: [],
        },
      },
    ],
    aggregate_confidence: 0.72,
    model_version: 'v3.0-Session-Differentiated',
  },
];

const DEMO_DECISIONS: ResponseDecision[] = [
  {
    session_id: 'u001_session_1',
    decision_confidence: 0.78,
    priority_rank: 1,
    urgency_level: 'High',
    recommended_actions: [
      {
        action_type: 'Isolate Host',
        target: { type: 'Host', identifier: 'host-b' },
        recommended_within_seconds: 300,
        justification: {
          predicted_scenarios: ['T1021->T1003->T1041'],
          risk_reduction: { absolute: 0.45, relative: 'Mitigates 70% of lateral movement risk' },
        },
      },
    ],
    rejected_actions: [
      { candidate_action: 'Disable Account', rejection_reasons: ['Confidence too low for disruptive action'] },
    ],
    decision_explainability: {
      why_now: 'High probability (65%) of T1021 within 300s',
      why_not_later: 'Delay increases lateral movement window',
      what_happens_if_ignored: 'Unmitigated Risk: 65% chance of T1021 execution',
    },
  },
];

export default function Index() {
  const { inputFile, isRunning, startPipeline, stopPipeline, reset } = usePipelineStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // In production, these would come from actual pipeline results
  const [pathReports] = useState<PathReport[]>(DEMO_PATH_REPORTS);
  const [forecasts] = useState<TrajectoryForecast[]>(DEMO_FORECASTS);
  const [decisions] = useState<ResponseDecision[]>(DEMO_DECISIONS);

  const handleStart = () => {
    if (!inputFile) {
      alert('Please upload a log file first');
      return;
    }
    startPipeline();
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-glow-primary">PredictPath</h1>
              <p className="text-xs text-muted-foreground">Advanced Threat Analysis Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={handleStart} className="gap-2" disabled={!inputFile}>
                <Play className="h-4 w-4" />
                Run Analysis
              </Button>
            ) : (
              <Button onClick={stopPipeline} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
            <Button onClick={reset} variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="graph">Attack Graph</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Input & Pipeline */}
              <div className="space-y-6">
                <FileUploader />
                <PipelineStatus />
              </div>

              {/* Center: Terminal */}
              <div className="lg:col-span-2">
                <TerminalView />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="graph" className="h-[600px]">
            <AttackGraph pathReports={pathReports} />
          </TabsContent>

          <TabsContent value="response" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrajectoryPanel forecasts={forecasts} />
              <ResponseBoard decisions={decisions} />
            </div>
            <SystemStatusPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <ResultsCharts 
              pathReports={pathReports}
              forecasts={forecasts}
              decisions={decisions}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
