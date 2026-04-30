/**
 * ChatWindow Component - Neo-Cybernetic Edition
 * ==============================================
 * Full-height immersive chat terminal with center-aligned
 * threading and enhanced UX with thinking indicators.
 */

import React, { useRef, useEffect, useState } from "react";
import { MessageCircle, RefreshCw, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";

function ChatWindow({
  messages,
  isTyping,
  onRetry,
  activeAgentName,
  onScrollUp,
  highlightedMessageIds = [],
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle infinite scroll up
  const handleScroll = (e) => {
    const element = e.target;
    if (element.scrollTop === 0 && canLoadMore && onScrollUp) {
      setCanLoadMore(false);
      onScrollUp(() => setCanLoadMore(true));
    }
  };

  return (
    <div
      ref={containerRef}
      className="chat-terminal flex-1 flex flex-col"
    >
      {/* Chat Messages */}
      <div
        className="chat-messages custom-scrollbar"
        onScroll={handleScroll}
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 stagger-1">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-2xl opacity-20" />
              <div className="relative glass-card rounded-2xl p-4">
                <MessageCircle size={32} className="text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-2 stagger-2">
              E-Commerce AI Support
            </h2>

            <p className="text-slate-400 mb-6 stagger-3 max-w-sm">
              Real-time multi-agent orchestration dashboard. Ask anything about
              your account, billing, or orders.
            </p>

            <div className="stagger-4 flex gap-2 flex-wrap justify-center">
              {[
                "📦 Track Orders",
                "💳 Billing Help",
                "🔄 Returns & Refunds",
                "🛍️ Product Info",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              "flex w-full transition-all duration-300",
              message.isUser ? "justify-end" : "justify-start",
              highlightedMessageIds?.includes(message.id) &&
                "message-highlighted"
            )}
          >
            <MessageBubble
              message={message.text}
              isUser={message.isUser}
              isError={Boolean(message.isError)}
              agentName={activeAgentName && !message.isUser ? activeAgentName : null}
              isHighlighted={highlightedMessageIds?.includes(message.id)}
            />
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="message-bubble message-ai max-w-[60%]">
              {activeAgentName && (
                <p className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {activeAgentName} is thinking...
                </p>
              )}
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Retry Button */}
        {onRetry &&
          messages.length > 0 &&
          messages[messages.length - 1]?.isError && (
            <div className="flex justify-start w-full">
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/20 hover:border-white/30 active:scale-95"
              >
                <RefreshCw size={14} />
                Retry last query
              </button>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;