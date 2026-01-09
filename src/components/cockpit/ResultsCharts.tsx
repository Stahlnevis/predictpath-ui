import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PathReport, TrajectoryForecast, ResponseDecision, ExecutionReport, getTechniqueName } from '@/types/pipeline';

interface ResultsChartsProps {
  pathReports: PathReport[];
  forecasts: TrajectoryForecast[];
  decisions: ResponseDecision[];
  executionReport?: ExecutionReport;
}

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  primary: '#00d4ff',
  accent: '#a855f7',
};

export function ResultsCharts({ pathReports, forecasts, decisions, executionReport }: ResultsChartsProps) {
  // Risk Score Distribution
  const riskData = pathReports.map((r, i) => ({
    name: `Session ${i + 1}`,
    score: r.path_anomaly_score,
    blastRadius: r.blast_radius.length,
  }));

  // Urgency Distribution
  const urgencyData = [
    { name: 'Critical', value: decisions.filter(d => d.urgency_level === 'Critical').length, color: COLORS.critical },
    { name: 'High', value: decisions.filter(d => d.urgency_level === 'High').length, color: COLORS.high },
    { name: 'Medium', value: decisions.filter(d => d.urgency_level === 'Medium').length, color: COLORS.medium },
    { name: 'Low', value: decisions.filter(d => d.urgency_level === 'Low').length, color: COLORS.low },
  ].filter(d => d.value > 0);

  // Technique frequency
  const techniqueFreq: Record<string, number> = {};
  forecasts.forEach(f => {
    f.current_state.observed_techniques.forEach(t => {
      techniqueFreq[t] = (techniqueFreq[t] || 0) + 1;
    });
  });
  const techniqueData = Object.entries(techniqueFreq)
    .map(([tech, count]) => ({ name: getTechniqueName(tech), fullName: tech, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Confidence radar
  const confidenceData = forecasts.slice(0, 6).map((f, i) => ({
    subject: `S${i + 1}`,
    confidence: f.aggregate_confidence * 100,
    scenarios: f.predicted_scenarios.length * 20,
  }));

  // Execution stats
  const execData = executionReport ? [
    { name: 'Success', value: executionReport.summary_stats.success, color: COLORS.low },
    { name: 'Pending', value: executionReport.summary_stats.pending, color: COLORS.medium },
    { name: 'Blocked', value: executionReport.summary_stats.blocked, color: COLORS.critical },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Risk Score Chart */}
      <Card className="border-primary/30 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            📊 Risk Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(222 47% 8%)',
                  border: '1px solid hsl(var(--primary) / 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="score" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="blastRadius" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Urgency Pie Chart */}
      <Card className="border-primary/30 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🎯 Response Urgency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={urgencyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {urgencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(222 47% 8%)',
                  border: '1px solid hsl(var(--primary) / 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Technique Frequency */}
      <Card className="border-primary/30 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🔍 MITRE ATT&CK Techniques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={techniqueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={9} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(222 47% 8%)',
                  border: '1px solid hsl(var(--primary) / 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confidence Radar */}
      <Card className="border-primary/30 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🎯 Model Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={confidenceData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={8} />
              <Radar name="Confidence" dataKey="confidence" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
              <Radar name="Scenarios" dataKey="scenarios" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Execution Stats */}
      {execData.length > 0 && (
        <Card className="border-primary/30 bg-card/50 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              ⚡ Execution Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={execData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {execData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(222 47% 8%)',
                    border: '1px solid hsl(var(--primary) / 0.3)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
