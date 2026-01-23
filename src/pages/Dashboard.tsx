import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Network, 
  Monitor, 
  Globe, 
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle,
  LogOut,
  Cpu,
  Lock,
  Eye,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const securityCategories = [
  {
    id: "network",
    title: "Network Security",
    icon: Network,
    status: "monitoring",
    metrics: { threats: 3, blocked: 127, active: 12 },
    description: "Firewall rules, intrusion detection, and network traffic analysis",
    items: ["Firewall Protection", "IDS/IPS Monitoring", "Traffic Analysis", "VPN Security"]
  },
  {
    id: "endpoint",
    title: "Endpoint Security",
    icon: Monitor,
    status: "secure",
    metrics: { devices: 48, patched: 45, vulnerable: 3 },
    description: "Device protection, antivirus, and endpoint detection & response",
    items: ["Antivirus Status", "EDR Agents", "Patch Management", "Device Compliance"]
  },
  {
    id: "web",
    title: "Web Security",
    icon: Globe,
    status: "warning",
    metrics: { scans: 24, issues: 7, resolved: 17 },
    description: "Web application firewall, SSL certificates, and vulnerability scanning",
    items: ["WAF Protection", "SSL/TLS Status", "Vulnerability Scans", "API Security"]
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "secure":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Secure</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Warning</Badge>;
      case "monitoring":
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">Monitoring</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "secure":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "monitoring":
        return <Activity className="h-4 w-4 text-cyan-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <motion.header 
        className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/20 border border-primary/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">PredictPath AI</h1>
              <p className="text-[10px] text-muted-foreground">Security Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Pills */}
          <nav className="hidden sm:flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border">
            <Button variant="default" size="sm" className="text-xs h-7 bg-primary/20 hover:bg-primary/30">
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cockpit")}
              className="text-xs h-7 hover:bg-muted/50"
            >
              Technical Tools
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2 ml-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-foreground">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-muted-foreground">Non-Technical View</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* System Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">System Overview</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse text-green-500 text-xs">●</span>
                    <span className="text-xs text-muted-foreground">All Systems Operational</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Active Threats", value: "3", icon: AlertTriangle, color: "text-yellow-400" },
                    { label: "Blocked Today", value: "127", icon: Lock, color: "text-green-400" },
                    { label: "Devices Online", value: "48", icon: Cpu, color: "text-cyan-400" },
                    { label: "Scans Running", value: "2", icon: Eye, color: "text-primary" }
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Categories */}
          <div className="space-y-4">
            {securityCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <category.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            {category.title}
                            {getStatusIcon(category.status)}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(category.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries(category.metrics).map(([key, value]) => (
                        <div key={key} className="p-2 rounded bg-muted/20 border border-border text-center">
                          <p className="text-lg font-bold text-foreground">{value}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item) => (
                        <Badge 
                          key={item} 
                          variant="outline" 
                          className="text-xs bg-muted/30 border-border hover:border-primary/50 cursor-pointer transition-colors"
                        >
                          <Zap className="h-3 w-3 mr-1 text-primary" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="h-8 border-t border-border bg-card/50 px-4 flex items-center justify-between text-[10px] text-muted-foreground relative z-10">
        <div className="flex items-center gap-4">
          <span>PredictPath AI v1.0</span>
          <span className="text-border">|</span>
          <span>Security Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Non-Technical View Active</span>
          <span className="text-border">|</span>
          <span>Last Updated: Just now</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
