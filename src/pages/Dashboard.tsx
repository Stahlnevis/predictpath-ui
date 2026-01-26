import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Network, 
  Monitor, 
  Globe, 
  LogOut,
  Terminal,
  Upload,
  FileText,
  Folder,
  Wifi,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

// Backend URL for WebSocket
const WS_BASE = "ws://localhost:8001";

const securitySections = [
  {
    id: "network",
    title: "Network Security",
    icon: Network,
    status: "monitoring",
    description: "Firewall, IDS/IPS, Traffic Analysis",
    metrics: { threats: 3, blocked: 127 }
  },
  {
    id: "endpoint",
    title: "Endpoint Security",
    icon: Monitor,
    status: "secure",
    description: "Device Protection, EDR, Patch Management",
    metrics: { devices: 48, patched: 45 }
  },
  {
    id: "web",
    title: "Web Security",
    icon: Globe,
    status: "warning",
    description: "WAF, SSL/TLS, Vulnerability Scans",
    metrics: { scans: 24, issues: 7 }
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "--- AIRCRACK TERMINAL ---",
    "Ready for security analysis...",
    ""
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "secure":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">Secure</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-[10px]">Warning</Badge>;
      case "monitoring":
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-[10px]">Active</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "secure":
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
      case "monitoring":
        return <Activity className="h-3 w-3 text-cyan-400" />;
      default:
        return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(f => f.name);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setTerminalOutput(prev => [...prev, `[UPLOAD] ${newFiles.length} file(s) added to workspace`]);
    }
  };

  const runAircrack = () => {
    if (uploadedFiles.length === 0) {
      setTerminalOutput(prev => [...prev, "[ERROR] No files uploaded. Please upload capture files first."]);
      return;
    }

    setIsRunning(true);
    setTerminalOutput(prev => [...prev, "\n--- STARTING AIRCRACK ANALYSIS ---\n"]);

    // Simulate aircrack output (replace with actual WebSocket connection)
    const messages = [
      "Reading packets from capture file...",
      "Packets contained: 15,432",
      "Analyzing beacon frames...",
      "Found 3 access points:",
      "  BSSID: AA:BB:CC:DD:EE:FF - SSID: Network_1",
      "  BSSID: 11:22:33:44:55:66 - SSID: Network_2",
      "  BSSID: FF:EE:DD:CC:BB:AA - SSID: Network_3",
      "Starting key analysis...",
      "Testing WPA handshakes...",
      "\n--- ANALYSIS COMPLETE ---\n"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setTerminalOutput(prev => [...prev, messages[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 500);
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-cyan-500/20 border border-cyan-500/30">
            <Shield className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cyan-400">PredictPath AI</h1>
            <p className="text-[10px] text-neutral-500">Security Dashboard</p>
          </div>
        </div>

        {/* Navigation Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg border border-neutral-700">
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs h-7 bg-cyan-600 hover:bg-cyan-500"
            >
              Non-Technical
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cockpit")}
              className="text-xs h-7 hover:bg-neutral-700 text-neutral-400"
            >
              Technical
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 bg-neutral-700 mx-2" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">{user?.email?.split('@')[0]}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-7 w-7 hover:bg-red-500/20 hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex w-full pt-12 p-4 gap-4">
        
        {/* LEFT: Security Sections */}
        <Card className="w-1/4 border-neutral-800 bg-neutral-900">
          <CardHeader className="py-3 px-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-sm font-medium text-cyan-400">Security Modules</CardTitle>
            </div>
            <p className="text-[10px] text-neutral-500">System Protection Status</p>
          </CardHeader>
          <CardContent className="p-3 flex flex-col gap-3">
            {securitySections.map((section) => (
              <Card 
                key={section.id} 
                className="border-neutral-800 bg-neutral-950 hover:border-cyan-500/30 transition-all cursor-pointer"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        <section.icon className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                          {section.title}
                          {getStatusIcon(section.status)}
                        </h3>
                        <p className="text-[10px] text-neutral-500">{section.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(section.status)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(section.metrics).map(([key, value]) => (
                      <div key={key} className="flex-1 p-1.5 rounded bg-neutral-900 border border-neutral-800 text-center">
                        <p className="text-sm font-bold text-neutral-200">{value}</p>
                        <p className="text-[9px] text-neutral-500 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Separator className="bg-neutral-800 my-2" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Quick Actions</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-neutral-700 bg-neutral-950 hover:bg-neutral-800"
              >
                <Wifi className="h-3 w-3 mr-2 text-cyan-400" />
                Scan Network
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-neutral-700 bg-neutral-950 hover:bg-neutral-800"
              >
                <Lock className="h-3 w-3 mr-2 text-green-400" />
                Run Security Audit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-neutral-700 bg-neutral-950 hover:bg-neutral-800"
              >
                <Eye className="h-3 w-3 mr-2 text-yellow-400" />
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CENTER: Aircrack Terminal */}
        <Card className="flex-1 border-neutral-800 bg-black font-mono flex flex-col">
          <CardHeader className="py-2 px-4 border-b border-neutral-800 bg-neutral-900/50 flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <CardTitle className="text-sm font-medium text-neutral-400">Aircrack Terminal</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isRunning && <span className="animate-pulse text-green-500 text-xs">● Running</span>}
              <Button
                variant="default"
                size="sm"
                onClick={runAircrack}
                disabled={isRunning}
                className="h-7 text-xs bg-green-600 hover:bg-green-500"
              >
                Run Analysis
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto p-4 text-xs leading-relaxed text-green-500/90 whitespace-pre-wrap font-mono"
            >
              {terminalOutput.map((line, i) => (
                <div key={i} className={line.includes("ERROR") ? "text-red-400" : line.includes("---") ? "text-cyan-400" : ""}>
                  {line}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: File Storage */}
        <Card className="w-1/4 border-neutral-800 bg-neutral-900">
          <CardHeader className="py-3 px-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-sm font-medium text-cyan-400">File Storage</CardTitle>
            </div>
            <p className="text-[10px] text-neutral-500">Upload capture files for analysis</p>
          </CardHeader>
          <CardContent className="p-3 flex flex-col gap-3">
            {/* Upload Zone */}
            <label className="border-2 border-dashed border-neutral-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors bg-neutral-950">
              <Upload className="h-8 w-8 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400 text-center">Drop files here or click to upload</p>
              <p className="text-[10px] text-neutral-600 mt-1">.cap, .pcap, .csv</p>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept=".cap,.pcap,.csv,.txt"
                onChange={handleFileUpload}
              />
            </label>

            <Separator className="bg-neutral-800" />

            {/* File List */}
            <div className="flex-1">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">
                Uploaded Files ({uploadedFiles.length})
              </p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uploadedFiles.length === 0 ? (
                  <p className="text-xs text-neutral-600 italic">No files uploaded yet</p>
                ) : (
                  uploadedFiles.map((file, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 p-2 rounded bg-neutral-950 border border-neutral-800"
                    >
                      <FileText className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-xs text-neutral-300 truncate flex-1">{file}</span>
                      <Badge variant="outline" className="text-[9px] border-neutral-700">Ready</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            {/* Storage Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-center">
                <p className="text-lg font-bold text-neutral-200">{uploadedFiles.length}</p>
                <p className="text-[9px] text-neutral-500">Files</p>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-center">
                <p className="text-lg font-bold text-neutral-200">0 MB</p>
                <p className="text-[9px] text-neutral-500">Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between px-4 text-[10px] text-neutral-500">
        <div className="flex items-center gap-4">
          <span>PredictPath AI v1.0</span>
          <span className="text-neutral-700">|</span>
          <span>Security Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            All Systems Online
          </span>
          <span className="text-neutral-700">|</span>
          <span>Non-Technical View</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
