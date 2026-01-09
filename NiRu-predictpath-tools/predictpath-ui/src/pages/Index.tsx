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

const WS_BASE = "ws://localhost:8000";
const API_BASE = "http://localhost:8000";

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
      content: "Connected to Orchestration Backend.",
      timestamp: new Date(),
    },
  ]);

  // Results state
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);

  // Governance state
  const [governanceState, setGovernanceState] = useState({
    trustThreshold: null as number | null,
    momentum: null as "rising" | "falling" | "stable" | null,
    streakCount: null as number | null,
    isConnected: true,
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

  // Fetch Results Helper
  const fetchToolResult = async (path: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error("File not found");
      const data = await res.json();
      // The backend returns { content: string }
      // We need to parse the content string into JSON object
      try {
        const parsed = JSON.parse(data.content);
        setJsonData(parsed);
        addTerminalLine("success", `Results loaded from ${path}`);

        // Sync Governance State if applicable
        if (path.includes("status.json")) {
          const statusData = parsed;
          if (statusData && !statusData.error) {
            setGovernanceState({
              trustThreshold: statusData.containment_threshold,
              momentum: statusData.trend === 'relaxing' ? 'rising' : statusData.trend === 'tightening' ? 'falling' : 'stable',
              streakCount: statusData.success_streak,
              isConnected: true
            });
          }
        }

      } catch (e) {
        setJsonData({ raw: data.content }); // Fallback for non-JSON
      }
    } catch (err) {
      addTerminalLine("warning", `Could not load result file: ${path}`);
    }
  };

  // Handle tool execution
  const handleExecuteTool = useCallback(
    (tool: { id: number; name: string; command: string; inputPath: string; outputPath?: string }) => {
      let fullCommand = tool.command;
      if (tool.inputPath && !fullCommand.includes(tool.inputPath)) {
        if (tool.inputPath !== "") {
          fullCommand = `${fullCommand} "${tool.inputPath}"`;
        }
      }

      addTerminalLine("command", fullCommand);
      addTerminalLine("info", `Executing Tool ${tool.id}: ${tool.name}...`);

      setToolStatuses((prev) => ({ ...prev, [tool.id]: "running" }));
      setSystemStatus("running");
      setSelectedToolId(tool.id);
      setJsonData(null); // Clear previous results

      const ws = new WebSocket(`${WS_BASE}/ws/run`);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          tool_dir: `Tool${tool.id}`,
          command: fullCommand
        }));
      };

      ws.onmessage = (event) => {
        const msg = event.data;
        let type: TerminalLine["type"] = "info";
        if (msg.includes("Error") || msg.includes("Failed")) type = "error";
        if (msg.includes("Success") || msg.includes("Complete")) type = "success";

        addTerminalLine(type, msg.trim());
      };

      ws.onclose = () => {
        setToolStatuses((prev) => ({ ...prev, [tool.id]: "complete" }));
        addTerminalLine("success", `Tool ${tool.id} Execution Finished.`);
        setSystemStatus("idle");

        // Auto-fetch results if JSON
        if (tool.outputPath && tool.outputPath.endsWith(".json")) {
          fetchToolResult(tool.outputPath);
        }
      };

      ws.onerror = (err) => {
        addTerminalLine("error", "WebSocket Error: Failed to connect to backend.");
        setToolStatuses((prev) => ({ ...prev, [tool.id]: "error" }));
        setSystemStatus("error");
      };
    },
    [addTerminalLine]
  );

  // Handle reset
  const handleReset = useCallback(
    async (level: ResetLevel) => {
      setTerminalLines([
        {
          id: `reset-${Date.now()}`,
          type: "command",
          content: `# Initiating ${level.toUpperCase()} reset...`,
          timestamp: new Date(),
        },
      ]);

      if (level === "soft" || level === "hard") {
        try {
          const res = await fetch(`${API_BASE}/api/reset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: level })
          });
          const data = await res.json();
          if (res.ok) {
            addTerminalLine("success", `Physical Artifacts Deleted: ${data.deleted.join(", ")}`);
          } else {
            addTerminalLine("error", `Reset Failed: ${data.detail}`);
          }
        } catch (e) {
          addTerminalLine("error", "Backend Connection Failed for Reset.");
        }
      }

      switch (level) {
        case "soft":
          addTerminalLine("info", "UI State Cleared. Preserving Governance DB.");
          break;
        case "hard":
          addTerminalLine("warning", "Full Reset Complete. Governance Learning Cleared.");
          setGovernanceState({
            trustThreshold: null,
            momentum: null,
            streakCount: null,
            isConnected: true,
          });
          setUploadedFiles([]);
          // Re-init logic is not implicit, user needs to run init or we rely on backend.
          // For now, warn user.
          addTerminalLine("warning", "[Action Required] Run 'Tool 6 Init' command manually if needed.");
          break;
        case "replay":
          addTerminalLine("info", "Replay mode active.");
          break;
      }

      setToolStatuses({});
      setSelectedToolId(null);
      setJsonData(null);
    },
    [addTerminalLine]
  );

  const handleFilesReady = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      addTerminalLine("info", `${files.length} log file(s) staged for Tool 1 ingestion`);
    }
  }, [addTerminalLine]);

  const handleClearFiles = useCallback(() => {
    setUploadedFiles([]);
    addTerminalLine("info", "Uploaded files cleared");
  }, [addTerminalLine]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <CockpitHeader onReset={handleReset} systemStatus={systemStatus} />

      <div className="flex-1 flex overflow-hidden relative z-10">
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

          <div className="mt-4">
            <GovernanceStatus
              trustThreshold={governanceState.trustThreshold}
              momentum={governanceState.momentum}
              streakCount={governanceState.streakCount}
              isConnected={governanceState.isConnected}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-96 border-l border-border bg-card/30 backdrop-blur-sm"
        >
          <ResultsPanel selectedToolId={selectedToolId} jsonData={jsonData} />
        </motion.div>
      </div>

      <footer className="h-8 border-t border-border bg-card/50 px-4 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>PredictPath AI v1.0</span>
          <span className="text-border">|</span>
          <span>Command Cockpit UI Shell</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Real-Time CLI Integration Active</span>
          <span className="text-border">|</span>
          <span>Backend: Port 8000</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
