/**
 * AgentStatus Component
 * =====================
 * Displays a badge indicating which agent is currently active.
 * Shows an animated pulsing dot when an agent is processing.
 *
 * The agent types are:
 * - triage: First responder, classifies the query
 * - billing: Handles billing-related inquiries
 * - refund: Handles refund requests
 * - general: Handles general inquiries
 * - validation: Validates the final response
 *
 * Props:
 * - currentAgent: String representing the active agent (null when idle)
 */

import React from "react";
import { cn } from "@/lib/utils";

// Agent display configuration
// Each agent has a label and color scheme for its badge
const AGENT_INFO = {
  triage: {
    label: "Triage Agent",
    color: "bg-blue-50 text-blue-600 border-blue-200"
  },
  billing: {
    label: "Billing Agent",
    color: "bg-violet-50 text-violet-600 border-violet-200"
  },
  refund: {
    label: "Refund Agent",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200"
  },
  general: {
    label: "General Agent",
    color: "bg-slate-50 text-slate-600 border-slate-200"
  },
  validation: {
    label: "Validating",
    color: "bg-amber-50 text-amber-600 border-amber-200"
  },
};

function AgentStatus({ currentAgent }) {
  // Don't render anything when no agent is active
  if (!currentAgent) return null;

  // Get agent info from the config, with fallback for unknown agents
  const info = AGENT_INFO[currentAgent] || {
    label: currentAgent,
    color: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    // Badge container with dynamic color classes
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
      info.color
    )}>
      {/* Animated pulsing dot to indicate active processing */}
      <span className="relative flex h-2 w-2">
        {/* Outer ring - expands and fades (the "ping") */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        {/* Inner dot - solid center */}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
      </span>

      {/* Agent label text */}
      {info.label}
    </div>
  );
}

export default AgentStatus;