/**
 * ContextBridge Component
 * ======================
 * Displays conversation history as a collapsible accordion timeline
 * with subtle connector lines and metadata indicators.
 */

import React, { useState, useMemo } from "react";
import { ChevronDown, Clock, Tag, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

function ContextBridge({ history, onSelectContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups = {};

    history.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dateKey = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return Object.entries(groups).reverse();
  }, [history]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const getIntentColor = (intentTag) => {
    const colors = {
      order: "from-blue-500 to-cyan-500",
      billing: "from-amber-500 to-orange-500",
      refund: "from-green-500 to-emerald-500",
      product: "from-purple-500 to-pink-500",
      account: "from-indigo-500 to-purple-500",
      general: "from-slate-500 to-blue-500",
    };
    return colors[intentTag] || colors.general;
  };

  const timeFormatted = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="context-bridge">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="context-bridge-header"
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-secondary" />
          <span className="context-bridge-title">Previous Interaction Context</span>
          <span className="context-bridge-count">{history.length}</span>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Timeline Content */}
      {isOpen && (
        <div className="context-bridge-content">
          {groupedHistory.map(([dateKey, entries], groupIdx) => (
            <div key={dateKey} className="context-bridge-group">
              {/* Date Divider */}
              <button
                onClick={() => toggleGroup(dateKey)}
                className="context-bridge-date-button"
              >
                <div className="context-bridge-date-line" />
                <span className="context-bridge-date-label">{dateKey}</span>
              </button>

              {/* Timeline Items */}
              {expandedGroups[dateKey] !== false && (
                <div className="context-bridge-items">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="context-bridge-item"
                      onClick={() => onSelectContext?.(entry)}
                    >
                      {/* Timeline Connector */}
                      <div className="context-timeline-dot">
                        {entry.metadata?.agent_id && (
                          <Bot size={10} className="text-primary" />
                        )}
                      </div>

                      {/* Item Content */}
                      <div className="context-item-body">
                        {/* Header */}
                        <div className="context-item-header">
                          <span className="context-item-time">
                            {timeFormatted(entry.createdAt)}
                          </span>
                          {entry.metadata?.intent_tag && (
                            <span
                              className={cn(
                                "context-item-tag",
                                `bg-gradient-to-r ${getIntentColor(entry.metadata.intent_tag)}`
                              )}
                            >
                              <Tag size={10} />
                              {entry.metadata.intent_tag}
                            </span>
                          )}
                        </div>

                        {/* Message Preview */}
                        <p className="context-item-text">
                          {entry.text.substring(0, 80)}
                          {entry.text.length > 80 ? "..." : ""}
                        </p>

                        {/* Agent Badge */}
                        {entry.metadata?.agent_id && (
                          <span className="context-item-agent">
                            {entry.metadata.agent_id}
                          </span>
                        )}
                      </div>

                      {/* Hover Effect */}
                      <div className="context-item-hover-line" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContextBridge;
