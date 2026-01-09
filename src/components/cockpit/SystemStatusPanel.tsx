import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemStatus } from '@/types/pipeline';
import { Brain, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SystemStatusPanelProps {
  status?: SystemStatus;
}

export function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  if (!status) {
    return (
      <Card className="border-primary/30 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🧠 System Trust Level
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No system status available</p>
            <p className="text-sm">Run Tool 6 to initialize</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (status.trend) {
      case 'relaxing': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'tightening': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (status.trend) {
      case 'relaxing': return 'text-green-400';
      case 'tightening': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/30 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🧠 System Trust Level
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {status.version_id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trust Momentum */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trust Momentum</span>
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {status.trend.charAt(0).toUpperCase() + status.trend.slice(1)}
              </span>
            </div>
          </div>
          <div className="relative">
            <Progress value={50 + (status.trust_momentum * 200)} className="h-3" />
            <div 
              className="absolute top-0 left-1/2 w-0.5 h-3 bg-white/50 transform -translate-x-1/2"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Strict</span>
            <span>{status.trust_momentum.toFixed(4)}</span>
            <span>Relaxed</span>
          </div>
        </div>

        {/* Thresholds */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Containment Threshold</p>
            <p className="text-lg font-bold text-primary">
              {(status.containment_threshold * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Disruptive Threshold</p>
            <p className="text-lg font-bold text-accent">
              {(status.disruptive_threshold * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Streaks */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm">Success Streak</span>
          </div>
          <span className="font-bold text-green-400">{status.success_streak}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm">Failure Streak</span>
          </div>
          <span className="font-bold text-red-400">{status.failure_streak}</span>
        </div>
      </CardContent>
    </Card>
  );
}
