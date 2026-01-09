import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileJson,
  Table,
  BarChart3,
  Gauge,
  ChevronDown,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResultFile {
  toolId: number;
  filename: string;
  path: string;
  lastModified: Date | null;
  status: "pending" | "available" | "error";
}

const resultFiles: ResultFile[] = [
  {
    toolId: 1,
    filename: "events.parquet",
    path: "Tool1/output/events.parquet",
    lastModified: null,
    status: "pending",
  },
  {
    toolId: 2,
    filename: "risk_assessment.json",
    path: "Tool2/risk_assessment.json",
    lastModified: null,
    status: "pending",
  },
  {
    toolId: 3,
    filename: "trajectory_forecast.json",
    path: "Tool3/trajectory_forecast.json",
    lastModified: null,
    status: "pending",
  },
  {
    toolId: 4,
    filename: "response_plan.json",
    path: "Tool4/response_plan.json",
    lastModified: null,
    status: "pending",
  },
  {
    toolId: 5,
    filename: "execution_report.json",
    path: "Tool5/execution_report.json",
    lastModified: null,
    status: "pending",
  },
  {
    toolId: 6,
    filename: "governance.db",
    path: "Tool6/governance.db",
    lastModified: null,
    status: "pending",
  },
];

interface ResultsPanelProps {
  selectedToolId: number | null;
  jsonData: Record<string, unknown> | null;
}

export const ResultsPanel = ({ selectedToolId, jsonData }: ResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState("structured");
  const selectedFile = resultFiles.find((f) => f.toolId === selectedToolId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Results View</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Visualize real JSON outputs from tools
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Reload
          </Button>
        </div>
      </div>

      {/* File Selector */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap">
          {resultFiles.map((file) => (
            <Badge
              key={file.toolId}
              variant={selectedToolId === file.toolId ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                file.status === "pending" ? "opacity-50" : ""
              }`}
            >
              <FileJson className="h-3 w-3 mr-1" />
              Tool {file.toolId}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {!selectedToolId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <FileJson className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm font-medium">No Results Selected</p>
            <p className="text-xs text-center mt-2 max-w-xs">
              Execute a tool from the Pipeline Control panel to view its output here.
              Results are loaded from real JSON files.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="structured" className="flex-1">
                  <Table className="h-3.5 w-3.5 mr-1.5" />
                  Structured
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex-1">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="raw" className="flex-1">
                  <FileJson className="h-3.5 w-3.5 mr-1.5" />
                  Raw JSON
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="structured" className="h-full m-0 p-4">
                <StructuredView toolId={selectedToolId} data={jsonData} />
              </TabsContent>

              <TabsContent value="charts" className="h-full m-0 p-4">
                <ChartsView toolId={selectedToolId} data={jsonData} />
              </TabsContent>

              <TabsContent value="raw" className="h-full m-0 p-4">
                <RawJsonView data={jsonData} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="px-4 py-2 border-t border-border bg-card/30 text-[10px] text-muted-foreground flex items-center justify-between">
          <span className="font-mono">{selectedFile.path}</span>
          <span>
            {selectedFile.lastModified
              ? `Modified: ${selectedFile.lastModified.toLocaleString()}`
              : "Not yet generated"}
          </span>
        </div>
      )}
    </div>
  );
};

// Placeholder for Structured View
const StructuredView = ({
  toolId,
  data,
}: {
  toolId: number;
  data: Record<string, unknown> | null;
}) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Table className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm">Awaiting Tool {toolId} Output</p>
        <p className="text-xs mt-1">Run the tool to populate this view</p>
      </div>
    );
  }

  // Placeholder rendering based on tool
  const renderToolContent = () => {
    switch (toolId) {
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Tool 3: Trajectory Forecast</p>
              <p>This view will display:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Session cards with attack timelines</li>
                <li>MITRE ATT&CK technique mappings</li>
                <li>Probability bars for predicted paths</li>
                <li>Time window estimations</li>
              </ul>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Tool 4: Response Plan</p>
              <p>This view will display:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ranked response action table</li>
                <li>Risk reduction delta calculations</li>
                <li>"Why Now?" action explanations</li>
                <li>Priority ordering by urgency</li>
              </ul>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Tool 6: Governance State</p>
              <p>This view will display:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Trust threshold gauge (read-only)</li>
                <li>Momentum trend arrows</li>
                <li>Streak indicators</li>
                <li>Historical learning progression</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            <p>Structured view for Tool {toolId} output</p>
          </div>
        );
    }
  };

  return (
    <ScrollArea className="h-full">
      {renderToolContent()}
    </ScrollArea>
  );
};

// Placeholder for Charts View
const ChartsView = ({
  toolId,
  data,
}: {
  toolId: number;
  data: Record<string, unknown> | null;
}) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm">No Chart Data Available</p>
        <p className="text-xs mt-1">Run Tool {toolId} to generate visualizations</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-sm">Charts Placeholder</p>
      <p className="text-xs mt-1">Visualizations will render from real JSON data</p>
    </div>
  );
};

// Raw JSON View
const RawJsonView = ({ data }: { data: Record<string, unknown> | null }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileJson className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm">No JSON Data</p>
        <p className="text-xs mt-1">Execute the tool to view raw output</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </ScrollArea>
  );
};
