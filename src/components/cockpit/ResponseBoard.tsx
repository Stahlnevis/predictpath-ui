import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ResponseDecision, 
  getRiskBadgeVariant,
  getTechniqueName 
} from '@/types/pipeline';
import { AlertTriangle, Clock, Shield, ChevronRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResponseBoardProps {
  decisions: ResponseDecision[];
}

export function ResponseBoard({ decisions }: ResponseBoardProps) {
  if (decisions.length === 0) {
    return (
      <Card className="border-primary/30 bg-card/50 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🛡️ Response Prioritization Board
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No response decisions yet</p>
            <p className="text-sm">Run the analysis pipeline to see recommendations</p>
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
            🛡️ Response Prioritization Board
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {decisions.length} decisions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {decisions.map((decision, index) => (
              <motion.div
                key={decision.session_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">#{decision.priority_rank}</span>
                    <div>
                      <p className="font-medium text-sm">{decision.session_id}</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {(decision.decision_confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(decision.urgency_level)}>
                    {decision.urgency_level}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {decision.recommended_actions.map((action, actionIndex) => (
                    <div 
                      key={actionIndex}
                      className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30"
                    >
                      <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{action.action_type}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Target: {action.target.type} - {action.target.identifier}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {action.recommended_within_seconds}s
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rejected Actions */}
                {decision.rejected_actions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">Rejected:</p>
                    {decision.rejected_actions.slice(0, 2).map((rejected, rejIndex) => (
                      <div key={rejIndex} className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="h-3 w-3" />
                        <span>{rejected.candidate_action}: {rejected.rejection_reasons[0]}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explainability */}
                <div className="mt-3 pt-2 border-t border-border/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="text-foreground">{decision.decision_explainability.why_now}</p>
                      <p className="text-red-400">
                        If ignored: {decision.decision_explainability.what_happens_if_ignored}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
