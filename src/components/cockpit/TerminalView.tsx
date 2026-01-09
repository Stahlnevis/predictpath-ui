import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Minimize2, Maximize2, Copy, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { usePipelineStore } from '@/stores/pipelineStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLine {
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning' | 'command';
  tool?: number;
  message: string;
}

export function TerminalView() {
  const { tools, currentTool, isRunning } = usePipelineStore();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aggregate logs from all tools
  useEffect(() => {
    const allLogs: TerminalLine[] = [];
    tools.forEach((tool, index) => {
      tool.logs.forEach(log => {
        allLogs.push({
          timestamp: new Date(),
          type: tool.status === 'error' ? 'error' : 'info',
          tool: index + 1,
          message: log,
        });
      });
    });
    setLines(allLogs);
  }, [tools]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'command': return 'text-cyan-400';
      default: return 'text-green-300';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const handleCopy = () => {
    const text = lines.map(l => `[${formatTime(l.timestamp)}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setLines([]);
  };

  return (
    <motion.div
      className="flex flex-col bg-[hsl(222,47%,3%)] rounded-lg border border-primary/30 overflow-hidden"
      animate={{ height: isMinimized ? 'auto' : '100%' }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-primary/20 to-transparent border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-primary font-mono text-sm">
            <TerminalIcon className="h-4 w-4" />
            <span>PredictPath Terminal</span>
            {isRunning && (
              <span className="animate-pulse text-xs text-green-400">● ACTIVE</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 min-h-0"
          >
            <ScrollArea className="h-full max-h-[400px]" ref={scrollRef}>
              <div className="p-4 font-mono text-sm space-y-1">
                {/* Welcome message */}
                <div className="text-primary mb-4">
                  <pre className="text-xs opacity-70">{`
╔══════════════════════════════════════════════════════════════╗
║  ____               _ _      _   ____       _   _            ║
║ |  _ \\ _ __ ___  __| (_) ___| |_|  _ \\ __ _| |_| |__         ║
║ | |_) | '__/ _ \\/ _\` | |/ __| __| |_) / _\` | __| '_ \\        ║
║ |  __/| | |  __/ (_| | | (__| |_|  __/ (_| | |_| | | |       ║
║ |_|   |_|  \\___|\\__,_|_|\\___|\\__|_|   \\__,_|\\__|_| |_|       ║
║                                                              ║
║  Advanced Threat Path Analysis & Prediction Engine           ║
╚══════════════════════════════════════════════════════════════╝
                  `}</pre>
                </div>
                
                {lines.length === 0 ? (
                  <div className="text-muted-foreground">
                    <span className="text-primary">$</span> Awaiting log file input...
                    <span className="animate-pulse">▋</span>
                  </div>
                ) : (
                  lines.map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${getLineColor(line.type)} flex gap-2`}
                    >
                      <span className="text-muted-foreground text-xs">
                        [{formatTime(line.timestamp)}]
                      </span>
                      {line.tool && (
                        <span className="text-cyan-400 text-xs">
                          [Tool{line.tool}]
                        </span>
                      )}
                      <span>{line.message}</span>
                    </motion.div>
                  ))
                )}
                
                {/* Cursor */}
                <div className="text-green-400 flex items-center gap-1">
                  <span className="text-primary">$</span>
                  <span className="animate-pulse">▋</span>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
