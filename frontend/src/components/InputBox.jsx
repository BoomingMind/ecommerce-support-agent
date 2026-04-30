/**
 * InputBox Component - Neo-Cybernetic Edition
 * =============================================
 * Floating message input with glassmorphism styling
 * and smooth interactions.
 */

import React, { useState, useRef } from "react";
import { Send, Sparkles } from "lucide-react";

function InputBox({ onSend, isLoading }) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    // Allow Shift+Enter for multiline, Enter to send
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = !input.trim() || isLoading;

  return (
    <div className="floating-input-container">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="floating-input focus-glow">
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />

          {/* Thinking Indicator */}
          {isLoading && (
            <div className="flex items-center gap-1 px-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="send-button relative"
            title={isLoading ? "Processing..." : "Send message"}
          >
            {isLoading ? (
              <Sparkles size={16} className="animate-spin opacity-60" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {/* Helper Text */}
        {isFocused && !isLoading && (
          <p className="mt-2 text-xs text-slate-400 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">Enter</kbd> to
            send, <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">Shift+Enter</kbd> for new line
          </p>
        )}
      </form>
    </div>
  );
}

export default InputBox;