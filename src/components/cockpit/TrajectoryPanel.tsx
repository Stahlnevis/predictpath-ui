import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrajectoryForecast, getTechniqueName, getRiskBadgeVariant } from '@/types/pipeline';
import { Target, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrajectoryPanelProps {
  forecasts: TrajectoryForecast[];
}

export function TrajectoryPanel({ forecasts }: TrajectoryPanelProps) {
  if (forecasts.length === 0) {
    return (
      <Card className="border-primary/30 bg-card/50 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🎯 Attack Trajectory Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No trajectory predictions yet</p>
            <p className="text-sm">Run the analysis pipeline to see forecasts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-card/50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🎯 Attack Trajectory Predictions
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {forecasts.length} sessions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {forecasts.map((forecast, index) => (
              <motion.div
                key={forecast.session_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-border/50 bg-card/30"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{forecast.session_id}</p>
                    <p className="text-xs text-muted-foreground">
                      Model: {forecast.model_version}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {(forecast.aggregate_confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">confidence</p>
                  </div>
                </div>

                {/* Current State */}
                <div className="mb-3 p-2 rounded bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Observed Techniques:</p>
                  <div className="flex flex-wrap gap-1">
                    {forecast.current_state.observed_techniques.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {getTechniqueName(tech)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Blast Radius: {forecast.current_state.host_scope.length} hosts
                  </p>
                </div>

                {/* Suppression Warning */}
                {forecast.suppression_reason && (
                  <div className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 mb-3">
                    <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-xs text-yellow-400">{forecast.suppression_reason}</p>
                  </div>
                )}

                {/* Predicted Scenarios */}
                {forecast.predicted_scenarios.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Predicted Attack Paths:</p>
                    {forecast.predicted_scenarios.slice(0, 3).map((scenario, scenarioIndex) => (
                      <div 
                        key={scenarioIndex}
                        className="p-2 rounded border border-border/30 bg-background/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={getRiskBadgeVariant(scenario.risk_level)} className="text-xs">
                            {scenario.risk_level}
                          </Badge>
                          <span className="text-xs text-primary font-medium">
                            {(scenario.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        {/* Sequence */}
                        <div className="flex items-center gap-1 flex-wrap text-xs">
                          {scenario.sequence.map((tech, techIndex) => (
                            <React.Fragment key={techIndex}>
                              <span className="text-foreground">{getTechniqueName(tech)}</span>
                              {techIndex < scenario.sequence.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Time Window */}
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {scenario.reaction_time_window.min_seconds}s - {scenario.reaction_time_window.max_seconds}s
                          </span>
                        </div>

                        {/* Evidence */}
                        {scenario.explainability.positive_evidence.length > 0 && (
                          <p className="text-xs text-green-400 mt-1 truncate">
                            ✓ {scenario.explainability.positive_evidence[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
