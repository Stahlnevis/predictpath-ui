import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Network, Monitor, Globe, ChevronRight, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "non-technical" | "technical";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("non-technical");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleTechnicalClick = () => {
    navigate("/cockpit");
  };

  const securityCategories = [
    {
      id: "network",
      title: "Network Security",
      icon: Network,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description: "Protect your organization's network infrastructure from unauthorized access and cyber threats.",
      details: [
        "Firewall configuration and monitoring",
        "Intrusion Detection Systems (IDS)",
        "Virtual Private Networks (VPN)",
        "Network segmentation strategies",
        "Traffic analysis and anomaly detection"
      ],
      status: "Protected",
      statusColor: "text-green-400"
    },
    {
      id: "endpoint",
      title: "Endpoint Security",
      icon: Monitor,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description: "Secure all devices connected to your network including computers, mobile devices, and IoT.",
      details: [
        "Antivirus and anti-malware protection",
        "Device encryption and management",
        "Patch management and updates",
        "Application whitelisting",
        "Endpoint Detection and Response (EDR)"
      ],
      status: "Monitoring",
      statusColor: "text-yellow-400"
    },
    {
      id: "web",
      title: "Web Security",
      icon: Globe,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description: "Safeguard your web applications and online presence from attacks and vulnerabilities.",
      details: [
        "Web Application Firewall (WAF)",
        "SSL/TLS certificate management",
        "Cross-site scripting (XSS) prevention",
        "SQL injection protection",
        "DDoS mitigation strategies"
      ],
      status: "Active",
      statusColor: "text-green-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PredictPath AI</h1>
                <p className="text-xs text-muted-foreground">Security Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border">
                <Button
                  variant={viewMode === "non-technical" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("non-technical")}
                  className="text-xs"
                >
                  Non-Technical
                </Button>
                <Button
                  variant={viewMode === "technical" ? "default" : "ghost"}
                  size="sm"
                  onClick={handleTechnicalClick}
                  className="text-xs"
                >
                  Technical
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Your Security Center
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Monitor and understand your organization's security posture across all critical domains. 
            Select a category below to learn more about how we protect your assets.
          </p>
        </motion.div>

        {/* Security Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Overall Security Status</h3>
                    <p className="text-green-400 font-medium">Systems Protected</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-400">3</p>
                    <p className="text-xs text-muted-foreground">Active Shields</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">2</p>
                    <p className="text-xs text-muted-foreground">Alerts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">98%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {securityCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className={`h-full bg-card/50 backdrop-blur-sm border ${category.borderColor} hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${category.statusColor}`}>
                        {category.status}
                      </span>
                      <div className={`h-2 w-2 rounded-full ${category.statusColor.replace('text-', 'bg-')} animate-pulse`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Key Protections
                    </h4>
                    <ul className="space-y-2">
                      {category.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Need Advanced Controls?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Switch to Technical view to access the full PredictPath AI Command Cockpit with 
                    advanced threat analysis tools, attack path prediction, and autonomous defense pipelines.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleTechnicalClick}>
                    Go to Technical View
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>PredictPath AI v1.0 | Security Dashboard</span>
            <span>Last updated: Just now</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
