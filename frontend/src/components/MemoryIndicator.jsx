/**
 * MemoryIndicator Component
 * ========================
 * Displays context chips showing active topics and memory triggers
 * with pulse animations and secondary glow theme.
 */

import React, { useEffect, useState } from "react";
import { X, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

function MemoryIndicator({ contextChip, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (contextChip) {
      setIsVisible(true);
    }
  }, [contextChip]);

  if (!contextChip || !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className="memory-indicator-container">
      <div className="memory-indicator animate-float-in">
        {/* Icon */}
        <div className="memory-indicator-icon">
          <Brain size={14} className="animate-pulse-soft" />
        </div>

        {/* Content */}
        <div className="memory-indicator-content">
          <span className="memory-indicator-label">
            Context: {contextChip.topic}
          </span>
          <span className="memory-indicator-meta">
            {contextChip.messageCount} {contextChip.messageCount === 1 ? "message" : "messages"}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="memory-indicator-close"
          aria-label="Close context"
        >
          <X size={14} />
        </button>
      </div>

      {/* Message Preview Line */}
      {contextChip.messages && contextChip.messages.length > 0 && (
        <div className="memory-indicator-preview">
          <div className="memory-preview-item">
            <span className="memory-preview-dot" />
            <p className="memory-preview-text">
              {contextChip.messages[0].text.substring(0, 60)}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoryIndicator;
