import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function AgentSidebar({ agents, activeAgentId, isLoadingAgents }) {
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

  return (
    <aside className="slide-in-left glass-surface w-full border-r lg:w-80">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-sm font-semibold text-slate-100">Agents</h2>
        <p className="mt-1 text-xs text-slate-400">Live backend agent registry</p>
        <input
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder="Filter agents..."
          className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
        />
      </div>

      <div className="custom-scrollbar max-h-[calc(100vh-140px)] space-y-2 overflow-y-auto p-3">
        {isLoadingAgents && (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-xl bg-white/10" />
            <div className="h-16 animate-pulse rounded-xl bg-white/10" />
            <div className="h-16 animate-pulse rounded-xl bg-white/10" />
          </div>
        )}

        {!isLoadingAgents && visibleAgents.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-slate-400">
            No agents match this filter.
          </div>
        )}

        {!isLoadingAgents &&
          visibleAgents.map((agent) => {
            const isActive =
              activeAgentId &&
              (agent.id === activeAgentId ||
                agent.id === activeAgentId.toLowerCase() ||
                agent.name?.toLowerCase().includes(activeAgentId.toLowerCase()));

            return (
              <div
                key={agent.id || agent.name}
                title={agent.description}
                className={cn(
                  "agent-card glass-card rounded-xl border p-3 transition-colors",
                  isActive
                    ? "active"
                    : "opacity-95 hover:opacity-100"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-slate-100">{agent.name}</h3>
                  {isActive && (
                    <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-300">{agent.role}</p>
                <p className="mt-1 text-xs text-slate-400">{agent.description}</p>
              </div>
            );
          })}
      </div>
    </aside>
  );
}

export default AgentSidebar;
