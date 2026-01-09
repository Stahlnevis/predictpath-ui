import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileJson,
  Table as TableIcon,
  BarChart3,
  Activity,
  Shield,
  Zap,
  Lock,
  Unlock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResultFile {
  toolId: number;
  filename: string;
  path: string;
  status: "pending" | "available" | "error";
}

const resultFiles: ResultFile[] = [
  { toolId: 1, filename: "ingestion_summary.json", path: "Tool1/ingestion_summary.json", status: "pending" },
  { toolId: 2, filename: "path_report.json", path: "Tool2/path_report.json", status: "pending" },
  { toolId: 3, filename: "trajectory_forecast.json", path: "Tool3/trajectory_forecast.json", status: "pending" },
  { toolId: 4, filename: "response_plan.json", path: "Tool4/response_plan.json", status: "pending" },
  { toolId: 5, filename: "execution_report.json", path: "Tool5/execution_report.json", status: "pending" },
  { toolId: 6, filename: "status.json", path: "Tool6/status.json", status: "pending" },
];

interface ResultsPanelProps {
  selectedToolId: number | null;
  jsonData: any;
}

export const ResultsPanel = ({ selectedToolId, jsonData }: ResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState("structured");

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Results View</h2>
          <p className="text-xs text-muted-foreground">Tactical Visualizations</p>
        </div>
        <div className="flex gap-1">
          {resultFiles.map(f => (
            <div key={f.toolId} className={`transition-all duration-300 h-2 w-2 rounded-full ${selectedToolId === f.toolId ? 'bg-primary scale-125' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!selectedToolId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <Activity className="h-16 w-16 mb-4" />
            <p>Select a tool to view results</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pt-2 border-b border-border/50">
              <TabsList className="w-full">
                <TabsTrigger value="structured" className="flex-1"><TableIcon className="w-3 h-3 mr-2" />Visual</TabsTrigger>
                <TabsTrigger value="raw" className="flex-1"><FileJson className="w-3 h-3 mr-2" />Raw JSON</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden bg-muted/10">
              <TabsContent value="structured" className="h-full m-0 p-4 overflow-y-auto">
                {jsonData ? (
                  <ToolResultRenderer toolId={selectedToolId} data={jsonData} />
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 opacity-50" />
                    Waiting for output...
                  </div>
                )}
              </TabsContent>
              <TabsContent value="raw" className="h-full m-0 p-4 overflow-auto">
                <pre className="text-[10px] font-mono whitespace-pre-wrap text-foreground/70">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

const ToolResultRenderer = ({ toolId, data }: { toolId: number, data: any }) => {
  switch (toolId) {
    case 1: return <IngestionSummaryView data={data} />;
    case 2: return <PathReportView data={data} />;
    case 3: return <ForecastView data={data} />;
    case 4: return <ResponsePlanView data={data} />;
    case 5: return <ExecutionReportView data={data} />;
    case 6: return <GovernanceView data={data} />;
    default: return <div className="text-sm">Visualizer not implemented for Tool {toolId}</div>;
  }
}

// --- Tool Visualizers ---

const IngestionSummaryView = ({ data }: { data: any }) => {
  if (!data.total_events) return <div className="text-warning">No Summary Data</div>;

  const typeCounts = data.by_type || {};
  const successRate = (data.success / data.total_events) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-card/50 border-white/10 text-center py-2">
          <div className="text-2xl font-bold">{data.total_events}</div>
          <div className="text-[10px] text-muted-foreground">Total Events</div>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20 text-center py-2">
          <div className="text-2xl font-bold text-green-400">{data.success}</div>
          <div className="text-[10px] text-muted-foreground">Ingested</div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20 text-center py-2">
          <div className="text-2xl font-bold text-red-400">{data.failed}</div>
          <div className="text-[10px] text-muted-foreground">Rejected</div>
        </Card>
      </div>

      <Card className="bg-card/50 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Event Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(typeCounts).map(([type, count]: [string, any]) => (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{type}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <Progress value={(count / data.total_events) * 100} className="h-1.5" />
            </div>
          ))}
          {Object.keys(typeCounts).length === 0 && (
            <div className="text-xs text-muted-foreground">No distribution data</div>
          )}
        </CardContent>
      </Card>

      <div className="text-[10px] text-muted-foreground text-center">
        Source: {data.source_file}
      </div>
    </div>
  );
}

const PathReportView = ({ data }: { data: any[] }) => {
  if (!Array.isArray(data)) return <div className="text-warning">Invalid Data Format</div>;

  return (
    <div className="space-y-6">
      {data.map((session, idx) => (
        <Card key={idx} className="bg-card/50 border-white/10 overflow-hidden">
          <div className={`h-1 w-full ${session.path_anomaly_score > 8 ? 'bg-destructive' : 'bg-orange-500'}`} />
          <CardHeader className="pb-2 pt-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-mono truncate max-w-[200px]">{session.session_id}</CardTitle>
              <Badge variant={session.path_anomaly_score > 8 ? "destructive" : "secondary"}>
                Risk: {session.path_anomaly_score.toFixed(2)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="text-xs text-muted-foreground mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3 w-3" />
                <span className="font-semibold text-foreground">Attack Path</span>
              </div>
              <div className="pl-2 border-l-2 border-primary/20 space-y-4 ml-1.5">
                {session.events?.map((ev: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[13px] top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                    <div className="font-medium text-primary text-xs">{ev.mitre_technique || "Unknown Activity"}</div>
                    <div className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                      <span className="bg-white/5 px-1 rounded">{ev.source_host}</span>
                      <ArrowRight className="h-2 w-2" />
                      <span className="bg-white/5 px-1 rounded">{ev.target_host}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Blast Radius Impact</div>
              <div className="flex flex-wrap gap-1.5">
                {session.blast_radius?.map((host: string) => (
                  <Badge key={host} variant="secondary" className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">
                    <AlertTriangle className="h-2 w-2 mr-1" />
                    {host}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ForecastView = ({ data }: { data: any }) => {
  const sessions = Object.keys(data);

  return (
    <div className="space-y-6">
      {sessions.map(sid => {
        const forecast = data[sid];
        return (
          <Card key={sid} className="bg-card/50 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-mono truncate max-w-[180px]">{sid}</CardTitle>
                <Badge variant="outline" className="text-[10px]">Confidence: {(forecast.model_confidence * 100).toFixed(0)}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {forecast.scenarios?.slice(0, 3).map((sc: any, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs items-end">
                    <span className="font-medium max-w-[70%] truncate" title={sc.sequence}>{sc.sequence}</span>
                    <span className="text-primary font-bold">{(sc.probability * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={sc.probability * 100} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded ${sc.risk_level === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {sc.risk_level} Risk
                    </span>
                    <span>Window: {sc.time_window}s</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const ResponsePlanView = ({ data }: { data: any }) => {
  const strategies = data.ranked_strategy || [];

  return (
    <div className="grid grid-cols-1 gap-3">
      {strategies.map((strat: any, i: number) => (
        <Card key={i} className="bg-card/50 border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${strat.urgency === 'Critical' ? 'bg-destructive' : 'bg-warning'
            }`} />
          <CardContent className="p-3 pl-5">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-sm flex items-center gap-2">
                {strat.action_type === 'Block' ? <Shield className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                {strat.action_type}
              </div>
              <Badge variant={strat.urgency === 'Critical' ? "destructive" : "outline"} className="text-[10px]">
                {strat.urgency}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {strat.reasoning}
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <Badge variant="secondary" className="text-green-400 bg-green-400/10 border-green-400/20">
                Risk -{(strat.risk_reduction_delta * 100).toFixed(0)}%
              </Badge>
              <div className="flex items-center gap-1.5 text-muted-foreground bg-white/5 px-2 py-1 rounded">
                <Database className="h-3 w-3" />
                Target: {strat.target}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ExecutionReportView = ({ data }: { data: any }) => {
  const actions = data.executed_actions || [];

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Execution Log</div>
      {actions.map((act: any, i: number) => (
        <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-card/30">
          <div className="flex items-center gap-3">
            {act.status === 'success' ? (
              <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-green-500 h-4 w-4" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <XCircle className="text-destructive h-4 w-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{act.action}</div>
              <div className="text-xs text-muted-foreground truncate">Target: {act.target}</div>
            </div>
            {act.rollback_generated && (
              <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-400/30 flex gap-1 items-center">
                <RefreshCw className="h-3 w-3" />
                Reversible
              </Badge>
            )}
          </div>
          {act.command && (
            <div className="ml-9">
              <code className="text-[10px] font-mono bg-black/40 p-1.5 rounded block w-full overflow-x-auto text-muted-foreground border border-white/5">
                &gt; {act.command}
              </code>
            </div>
          )}
        </div>
      ))}
      {actions.length === 0 && (
        <div className="text-center p-8 border border-dashed border-white/10 rounded-lg text-muted-foreground">
          No actions were executed based on the response plan.
        </div>
      )}
    </div>
  );
};

const GovernanceView = ({ data }: { data: any }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card/50 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Active Trust Model
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[10px]">{data.version_id}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Gauge Visualization */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Containment Threshold</span>
                <span className="text-primary">{(data.containment_threshold * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.containment_threshold * 100} className="h-2 bg-secondary" />
              <p className="text-[10px] text-muted-foreground">Below this trust level, hosts are isolated automatically.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Disruptive Action Threshold</span>
                <span className="text-destructive">{(data.disruptive_threshold * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.disruptive_threshold * 100} className="h-2 bg-destructive/10" />
              <p className="text-[10px] text-muted-foreground">Above this, risky blocks require approval.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Momentum</div>
              <div className={`text-2xl font-black flex items-center justify-center gap-2 ${data.trust_momentum > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                {data.trust_momentum > 0 ? <ArrowRight className="-rotate-45 h-5 w-5" /> : <ArrowRight className="rotate-45 h-5 w-5" />}
                {Math.abs(data.trust_momentum).toFixed(4)}
              </div>
              <div className="text-[10px] mt-1 opacity-70">
                {data.trend === 'relaxing' ? 'Adapting (Relaxing)' : 'Hardening (Tightening)'}
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stability Streak</div>
              <div className="text-2xl font-black text-blue-400 flex items-center justify-center gap-2">
                <Activity className="h-4 w-4" />
                {data.success_streak}
              </div>
              <div className="text-[10px] mt-1 opacity-70">Consecutive Successes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
        <div className="bg-blue-500/20 p-1.5 rounded-full shrink-0">
          <Database className="h-3 w-3 text-blue-400" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-blue-100 mb-0.5">Persistence Active</h4>
          <p className="text-[10px] text-blue-200/70">
            Tool 6 learning state is persisted in <code>Tool6/governance.db</code> and will influence future runs.
          </p>
        </div>
      </div>
    </div>
  );
};
