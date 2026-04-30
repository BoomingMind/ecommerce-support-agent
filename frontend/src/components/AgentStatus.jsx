/**
 * AgentStatus Component - Neo-Cybernetic Edition
 * ===============================================
 * Displays real-time agent status with thinking indicators
 * and glassmorphic design.
 */

import React from "react";
import { cn } from "@/lib/utils";

const AGENT_INFO = {
  triage: {
    label: "Triage",
    glow: "from-blue-500 to-cyan-500",
  },
  router: {
    label: "Router",
    glow: "from-indigo-500 to-purple-500",
  },
  context: {
    label: "Context",
    glow: "from-cyan-500 to-blue-500",
  },
  support: {
    label: "Support",
    glow: "from-orange-500 to-red-500",
  },
  sales: {
    label: "Sales",
    glow: "from-pink-500 to-rose-500",
  },
  billing: {
    label: "Billing",
    glow: "from-violet-500 to-purple-500",
  },
  refund: {
    label: "Refund",
    glow: "from-emerald-500 to-green-500",
  },
  general: {
    label: "General",
    glow: "from-slate-500 to-blue-500",
  },
  supervisor: {
    label: "Supervisor",
    glow: "from-amber-500 to-orange-500",
  },
};

function AgentStatus({ currentAgent }) {
  if (!currentAgent) return null;

  const info = AGENT_INFO[currentAgent] || {
    label: currentAgent,
    glow: "from-primary to-secondary",
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <div className="relative overflow-hidden rounded-lg border border-white/20 bg-surface-glass/50 px-4 py-2 backdrop-blur-glass">
        {/* Animated Background Gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-20",
            info.glow
          )}
        />

        {/* Content */}
        <div className="relative flex items-center gap-2">
          {/* Thinking Indicator */}
          <div className="agent-thinking-indicator">
            <div className="agent-thinking-dot" />
            <div className="agent-thinking-dot" />
            <div className="agent-thinking-dot" />
          </div>

          {/* Agent Label */}
          <span className="text-xs font-semibold text-slate-100">
            {info.label}
          </span>
        </div>

        {/* Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-lg opacity-30 blur-lg",
            `bg-gradient-to-r ${info.glow}`
          )}
        />
      </div>

      {/* Pulse Indicator */}
      <div className="flex h-3 w-3 items-center justify-center">
        <div className="agent-status-badge" />
      </div>
    </div>
  );
}

export default AgentStatus;