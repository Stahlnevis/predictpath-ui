import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CockpitHeader } from "@/components/cockpit/CockpitHeader";
import { PipelineControl } from "@/components/cockpit/PipelineControl";
import { TerminalPanel, TerminalLine } from "@/components/cockpit/TerminalPanel";
import { ResultsPanel } from "@/components/cockpit/ResultsPanel";
import { GovernanceStatus } from "@/components/cockpit/GovernanceStatus";
import { FileUploadPanel, UploadedFile } from "@/components/cockpit/FileUploadPanel";
import { ResetLevel } from "@/components/cockpit/ResetControls";

type ToolStatus = "idle" | "running" | "complete" | "error";

const Index = () => {
  // Pipeline state
  const [toolStatuses, setToolStatuses] = useState<Record<number, ToolStatus>>({});
  const [systemStatus, setSystemStatus] = useState<"idle" | "running" | "error">("idle");

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Terminal state
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: "init-1",
      type: "info",
      content: "PredictPath AI Command Cockpit initialized",
      timestamp: new Date(),
    },
    {
      id: "init-2",
      type: "info",
      content: "Awaiting tool execution commands...",
      timestamp: new Date(),
    },
  ]);

  // Results state
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);

  // Governance state (will be populated from real Tool6 output)
  const [governanceState, setGovernanceState] = useState({
    trustThreshold: null as number | null,
    momentum: null as "rising" | "falling" | "stable" | null,
    streakCount: null as number | null,
    isConnected: false,
  });

  // Add line to terminal
  const addTerminalLine = useCallback(
    (type: TerminalLine["type"], content: string) => {
      const newLine: TerminalLine = {
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        content,
        timestamp: new Date(),
      };
      setTerminalLines((prev) => [...prev, newLine]);
    },
    []
  );

  // Clear terminal
  const handleClearTerminal = useCallback(() => {
    setTerminalLines([
      {
        id: `clear-${Date.now()}`,
        type: "info",
        content: "Terminal cleared",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Handle tool execution
  // This is a PLACEHOLDER - actual execution will be connected to real CLI
  const handleExecuteTool = useCallback(
    (tool: { id: number; name: string; command: string; inputPath: string }) => {
      // Log the command that WOULD be executed
      const fullCommand = `${tool.command} "${tool.inputPath}"`;

      addTerminalLine("command", fullCommand);
      addTerminalLine("info", `Executing Tool ${tool.id}: ${tool.name}...`);

      // Update status
      setToolStatuses((prev) => ({ ...prev, [tool.id]: "running" }));
      setSystemStatus("running");
      setSelectedToolId(tool.id);

      // PLACEHOLDER: This is where real subprocess execution would happen
      // The UI is ready to receive real stdout/stderr streams
      addTerminalLine(
        "warning",
        "[PLACEHOLDER] Real CLI execution not yet connected"
      );
      addTerminalLine(
        "info",
        "This UI shell is ready to be connected to real Tool folders"
      );

      // Simulate completion for UI demonstration
      setTimeout(() => {
        setToolStatuses((prev) => ({ ...prev, [tool.id]: "complete" }));
        addTerminalLine("success", `Tool ${tool.id} placeholder completed`);

        // Check if all tools done
        const allComplete = Object.values({
          ...toolStatuses,
          [tool.id]: "complete",
        }).every((s) => s === "complete" || s === "idle");
        if (allComplete) {
          setSystemStatus("idle");
        }
      }, 1500);
    },
    [addTerminalLine, toolStatuses]
  );

  // Handle reset
  // This is a PLACEHOLDER - actual reset will execute real commands
  const handleReset = useCallback(
    (level: ResetLevel) => {
      // Clear terminal first for a clean slate
      setTerminalLines([
        {
          id: `reset-${Date.now()}`,
          type: "command",
          content: `# Initiating ${level.toUpperCase()} reset...`,
          timestamp: new Date(),
        },
      ]);

      switch (level) {
        case "soft":
          addTerminalLine("info", "Clearing intermediate outputs...");
          addTerminalLine("info", "Preserving Tool6 governance.db");
          break;
        case "hard":
          addTerminalLine("warning", "Performing FULL reset...");
          addTerminalLine("warning", "Deleting governance.db...");
          addTerminalLine("info", "Re-initializing Tool6...");
          setGovernanceState({
            trustThreshold: null,
            momentum: null,
            streakCount: null,
            isConnected: false,
          });
          // Also clear uploaded files on hard reset
          setUploadedFiles([]);
          break;
        case "replay":
          addTerminalLine("info", "Loading historical execution reports...");
          addTerminalLine("info", "Re-applying to Tool6 sequentially...");
          break;
      }

      // Reset tool statuses
      setToolStatuses({});
      setSelectedToolId(null);
      setJsonData(null);

      addTerminalLine(
        "warning",
        "[PLACEHOLDER] Real reset commands not yet connected"
      );
      addTerminalLine("success", `${level} reset placeholder completed`);
    },
    [addTerminalLine]
  );

  // Handle file upload
  const handleFilesReady = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      addTerminalLine("info", `${files.length} log file(s) staged for Tool 1 ingestion`);
    }
  }, [addTerminalLine]);

  // Handle clear uploaded files
  const handleClearFiles = useCallback(() => {
    setUploadedFiles([]);
    addTerminalLine("info", "Uploaded files cleared");
  }, [addTerminalLine]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Cyber grid background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <CockpitHeader onReset={handleReset} systemStatus={systemStatus} />

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* LEFT PANEL - Pipeline Control */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden"
        >
          <FileUploadPanel
            onFilesReady={handleFilesReady}
            onClear={handleClearFiles}
          />
          <div className="flex-1 overflow-y-auto">
            <PipelineControl
              onExecute={handleExecuteTool}
              toolStatuses={toolStatuses}
              uploadedFiles={uploadedFiles}
            />
          </div>
        </motion.div>

        {/* CENTER PANEL - Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col p-4 min-w-0"
        >
          <div className="flex-1 min-h-0">
            <TerminalPanel
              lines={terminalLines}
              onClear={handleClearTerminal}
            />
          </div>

          {/* Governance Status - Below Terminal */}
          <div className="mt-4">
            <GovernanceStatus
              trustThreshold={governanceState.trustThreshold}
              momentum={governanceState.momentum}
              streakCount={governanceState.streakCount}
              isConnected={governanceState.isConnected}
            />
          </div>
        </motion.div>

        {/* RIGHT PANEL - Results View */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-96 border-l border-border bg-card/30 backdrop-blur-sm"
        >
          <ResultsPanel selectedToolId={selectedToolId} jsonData={jsonData} />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="h-8 border-t border-border bg-card/50 px-4 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>PredictPath AI v1.0</span>
          <span className="text-border">|</span>
          <span>Command Cockpit UI Shell</span>
        </div>
        <div className="flex items-center gap-4">
          <span>By Mahmoud Shee</span>
          <span className="text-border">|</span>
          <span>Real CLI Orchestration Mode</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
