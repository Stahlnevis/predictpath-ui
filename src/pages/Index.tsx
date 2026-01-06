import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  TrendingDown,
  Zap,
} from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TTCCountdown } from "@/components/dashboard/TTCCountdown";
import { AttackGraph } from "@/components/dashboard/AttackGraph";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { PipelineVisualizer } from "@/components/dashboard/PipelineVisualizer";
import { RiskScoreGauge } from "@/components/dashboard/RiskScoreGauge";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Cyber grid background */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  Security Command Center
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Real-time predictive threat intelligence • Last updated:{" "}
                  <span className="font-mono text-primary">
                    {new Date().toLocaleTimeString()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                  <span className="text-sm font-medium text-success">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Threats"
              value={23}
              subtitle="Across 47 assets"
              icon={AlertTriangle}
              trend="down"
              trendValue="12%"
              variant="critical"
            />
            <MetricCard
              title="Predictions Made"
              value="1,247"
              subtitle="94.2% accuracy"
              icon={Zap}
              trend="up"
              trendValue="8%"
              variant="default"
            />
            <MetricCard
              title="Avg Time-to-Compromise"
              value="2.3h"
              subtitle="3 critical assets"
              icon={Clock}
              trend="neutral"
              trendValue="0%"
              variant="warning"
            />
            <MetricCard
              title="Threats Mitigated"
              value={847}
              subtitle="This week"
              icon={Shield}
              trend="up"
              trendValue="23%"
              variant="success"
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column - Attack Graph & Pipeline */}
            <div className="space-y-6 lg:col-span-8">
              <AttackGraph />
              <PipelineVisualizer />
            </div>

            {/* Right Column - Risk & TTC */}
            <div className="space-y-6 lg:col-span-4">
              <RiskScoreGauge score={73} trend="down" trendValue="-5 pts" />
              <TTCCountdown />
            </div>
          </div>

          {/* Alert Feed Section */}
          <div className="mt-6">
            <AlertFeed />
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-border pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>
                  PredictPath AI v1.0 • Predictive Cyber Defense Platform
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>By Mahmoud Shee</span>
                <span className="text-border">|</span>
                <span>AI for Cybersecurity & Sustainable Development</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
