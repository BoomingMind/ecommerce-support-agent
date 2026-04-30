import React, { useMemo, useState } from "react";
import { ChevronRight, BarChart3, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function AgentSidebar({ agents, activeAgentId, isLoadingAgents }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterText, setFilterText] = useState("");

  const visibleAgents = useMemo(() => {
    const normalized = filterText.trim().toLowerCase();
    if (!normalized) return agents;
    return agents.filter((agent) => {
      const name = (agent.name || "").toLowerCase();
      const role = (agent.role || "").toLowerCase();
      const description = (agent.description || "").toLowerCase();
      return (
        name.includes(normalized) ||
        role.includes(normalized) ||
        description.includes(normalized)
      );
    });
  }, [agents, filterText]);

  const getAgentIcon = (agentId) => {
    const id = agentId?.toLowerCase();
    if (id?.includes("sales")) return <BarChart3 size={20} />;
    if (id?.includes("support")) return <AlertCircle size={20} />;
    if (id?.includes("billing")) return <BarChart3 size={20} />;
    if (id?.includes("refund")) return <Users size={20} />;
    return <Users size={20} />;
  };

  const agentsByType = useMemo(() => {
    const grouped = {};
    visibleAgents.forEach((agent) => {
      const type = agent.type || "Other";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(agent);
    });
    return grouped;
  }, [visibleAgents]);

  return (
    <>
      {/* Collapsed Vertical Rail */}
      <aside
        className="fixed left-0 top-0 h-screen w-20 flex-col items-center border-r border-white/10 bg-surface-glass/40 py-4 backdrop-blur-glass flex z-40"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Users size={24} className="text-white" />
          </div>
        </div>

        {/* Agent Rail Icons */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
          {isLoadingAgents ? (
            <>
              <div className="nav-rail-icon h-12 w-12 animate-pulse bg-white/10" />
              <div className="nav-rail-icon h-12 w-12 animate-pulse bg-white/10" />
              <div className="nav-rail-icon h-12 w-12 animate-pulse bg-white/10" />
            </>
          ) : (
            visibleAgents.slice(0, 6).map((agent, idx) => (
              <div
                key={agent.id || agent.name}
                className={cn(
                  "nav-rail-icon group relative",
                  activeAgentId?.toLowerCase() ===
                    agent.id?.toLowerCase() ||
                  activeAgentId?.toLowerCase() ===
                    agent.name?.toLowerCase()
                    ? "active"
                    : ""
                )}
                title={agent.name}
              >
                {getAgentIcon(agent.id)}
                {activeAgentId?.toLowerCase() ===
                  agent.id?.toLowerCase() ||
                activeAgentId?.toLowerCase() ===
                  agent.name?.toLowerCase() ? (
                  <div className="agent-status-badge" />
                ) : null}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Expandable Panel */}
      {isExpanded && (
        <div
          className="fixed left-20 top-0 z-30 h-screen w-72 animate-slide-horizontal border-r border-white/10 bg-surface-glass backdrop-blur-glass p-4 overflow-y-auto custom-scrollbar"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="mb-4 space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">
              Agent Registry
            </h2>
            <p className="text-xs text-slate-400">
              Live backend orchestration
            </p>
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter agents..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-primary focus:bg-white/10 focus:shadow-glow"
            />
          </div>

          {/* Agent Cards by Type */}
          <div className="space-y-4">
            {isLoadingAgents ? (
              <>
                <div className="h-24 animate-pulse rounded-xl bg-white/10" />
                <div className="h-24 animate-pulse rounded-xl bg-white/10" />
              </>
            ) : Object.keys(agentsByType).length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-slate-400">
                No agents match filter
              </div>
            ) : (
              Object.entries(agentsByType).map(([type, typeAgents], idx) => (
                <div key={type} className={`stagger-${idx + 1}`}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/70">
                    {type}
                  </h3>
                  <div className="space-y-2">
                    {typeAgents.map((agent) => {
                      const isActive =
                        activeAgentId?.toLowerCase() ===
                          agent.id?.toLowerCase() ||
                        activeAgentId?.toLowerCase() ===
                          agent.name?.toLowerCase();
                      return (
                        <div
                          key={agent.id || agent.name}
                          className={cn(
                            "agent-card group relative",
                            isActive ? "active" : ""
                          )}
                          title={agent.description}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-slate-100">
                                {agent.name}
                              </h3>
                              <p className="mt-1 text-xs font-medium text-slate-300">
                                {agent.role}
                              </p>
                            </div>
                            {isActive && (
                              <div className="agent-status-badge" />
                            )}
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            {agent.description}
                          </p>

                          {/* Thinking Indicator */}
                          {isActive && (
                            <div className="agent-thinking-indicator mt-2">
                              <span>Thinking</span>
                              <div className="agent-thinking-dot" />
                              <div className="agent-thinking-dot" />
                              <div className="agent-thinking-dot" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AgentSidebar;
