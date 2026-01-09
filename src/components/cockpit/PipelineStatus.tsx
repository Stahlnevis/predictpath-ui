import React from 'react';
import { Check, Loader2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePipelineStore } from '@/stores/pipelineStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TOOL_ICONS = ['📥', '🔍', '🎯', '🛡️', '⚡', '🧠'];
const TOOL_DESCRIPTIONS = [
  'Ingest & normalize security logs',
  'Build behavioral path graphs',
  'Predict attack trajectories',
  'Prioritize response actions',
  'Execute containment measures',
  'Learn & adapt thresholds',
];

export function PipelineStatus() {
  const { tools, currentTool, isRunning } = usePipelineStore();

  const completedTools = tools.filter(t => t.status === 'success').length;
  const progress = (completedTools / tools.length) * 100;

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            Analysis Pipeline
          </CardTitle>
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2 mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {completedTools}/{tools.length} tools completed
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {tools.map((tool, index) => {
          const isActive = currentTool === tool.tool;
          const isPending = tool.status === 'pending';
          const isComplete = tool.status === 'success';
          const isError = tool.status === 'error';
          const isRunningTool = tool.status === 'running';

          return (
            <motion.div
              key={tool.tool}
              initial={false}
              animate={{
                backgroundColor: isActive ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                borderColor: isActive ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))',
              }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                isActive && 'border-primary/50 bg-primary/10',
                isComplete && 'border-green-500/30',
                isError && 'border-red-500/30'
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm',
                isPending && 'bg-muted text-muted-foreground',
                isRunningTool && 'bg-primary/20 text-primary',
                isComplete && 'bg-green-500/20 text-green-400',
                isError && 'bg-red-500/20 text-red-400'
              )}>
                {isRunningTool && <Loader2 className="h-4 w-4 animate-spin" />}
                {isComplete && <Check className="h-4 w-4" />}
                {isError && <AlertCircle className="h-4 w-4" />}
                {isPending && <Clock className="h-4 w-4" />}
              </div>

              {/* Tool Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TOOL_ICONS[index]}</span>
                  <span className={cn(
                    'font-medium text-sm truncate',
                    isActive && 'text-primary',
                    isComplete && 'text-green-400',
                    isError && 'text-red-400'
                  )}>
                    Tool {tool.tool}: {tool.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {TOOL_DESCRIPTIONS[index]}
                </p>
              </div>

              {/* Arrow for active */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <ChevronRight className="h-5 w-5 text-primary" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
