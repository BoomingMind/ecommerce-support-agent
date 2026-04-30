/**
 * ChatWindow Component
 * ====================
 * Displays the chat message history with support for:
 * - User messages (right-aligned)
 * - AI messages (left-aligned)
 * - Typing indicator (animated dots while waiting)
 * - Auto-scrolling to latest message
 *
 * Props:
 * - messages: Array of message objects { text: string, isUser: boolean }
 * - isTyping: Boolean to show/hide typing indicator
 */

import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

function ChatWindow({ messages, isTyping, onRetry, activeAgentName }) {
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef(null);

  /**
   * Scrolls the chat view to the most recent message
   * Called whenever messages change or new typing indicator appears
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect: Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    // Scrollable container with custom scrollbar styling
    <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">

      {/* Centered content area with max-width constraint */}
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">

        {/* Empty state - shown when no messages exist */}
        {messages.length === 0 && (
          <div className="text-center py-16">
            {/* Chat icon in a neutral background circle */}
            <div className="glass-surface w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            {/* Welcome heading */}
            <h2 className="text-lg font-semibold text-slate-100">
              Customer Support
            </h2>

            {/* Subtitle */}
            <p className="text-slate-400 mt-1">
              How can I help you today?
            </p>
          </div>
        )}

        {/* Render all messages in the conversation */}
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message.text}
            isUser={message.isUser}
            isError={Boolean(message.isError)}
          />
        ))}

        {/* Typing indicator - shown when AI is "thinking" or responding */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-white/10">
              {activeAgentName && (
                <p className="mb-2 text-[11px] font-medium text-slate-300">
                  {activeAgentName} is responding...
                </p>
              )}
              {/* Three animated dots with staggered bounce animation */}
              <div className="flex gap-1.5 items-center">
                <span
                  className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {onRetry && messages.length > 0 && messages[messages.length - 1]?.isError && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 transition active:scale-95 hover:bg-white/20"
            >
              Retry last query
            </button>
          </div>
        )}

        {/* Invisible element at the end for auto-scrolling target */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;