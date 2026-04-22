/**
 * MessageBubble Component
 * =======================
 * Renders a single chat message bubble.
 * - User messages: Dark background, right-aligned
 * - AI messages: Light background with border, left-aligned
 *
 * Props:
 * - message: The text content of the message
 * - isUser: Boolean indicating if this is a user message (true) or AI (false)
 */

import React from "react";
import { cn } from "@/lib/utils";

function MessageBubble({ message, isUser }) {
  return (
    <div
      // Flex container - justify-end for user (right side), justify-start for AI (left side)
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        // Dynamic styling based on message sender
        // User: dark background, white text
        // AI: white background with border and shadow
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-neutral-900 text-white rounded-br-md"
            : "bg-white text-neutral-900 rounded-bl-md border border-neutral-200"
        )}
      >
        {/* Message text content */}
        {message}
      </div>
    </div>
  );
}

export default MessageBubble;