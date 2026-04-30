/**
 * MessageBubble Component - Neo-Cybernetic Edition
 * ================================================
 * Renders chat messages with markdown and code syntax highlighting.
 * Supports inline code, code blocks, bold, italic, and links.
 */

import React from "react";
import { cn } from "@/lib/utils";

// Simple markdown parser for common patterns
const parseMarkdown = (text) => {
  let elements = [];
  let lastIndex = 0;

  // Regex patterns for markdown elements
  const patterns = [
    // Code blocks (```language \n code \n```)
    {
      regex: /```(\w*)\n([\s\S]*?)```/g,
      type: "codeBlock",
    },
    // Inline code
    {
      regex: /`([^`]+)`/g,
      type: "inlineCode",
    },
    // Bold
    {
      regex: /\*\*([^*]+)\*\*/g,
      type: "bold",
    },
    // Italic
    {
      regex: /\*([^*]+)\*/g,
      type: "italic",
    },
    // Links
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/g,
      type: "link",
    },
  ];

  // Simple implementation: split by patterns and apply styling
  let processedText = text;

  // Handle code blocks first
  const codeBlockMatches = [...text.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
  if (codeBlockMatches.length > 0) {
    return (
      <>
        {codeBlockMatches.map((match, idx) => {
          const [fullMatch, language, code] = match;
          const beforeText = text.substring(lastIndex, match.index);
          lastIndex = match.index + fullMatch.length;

          return (
            <React.Fragment key={idx}>
              {beforeText && <span>{beforeText}</span>}
              <pre className="message-code-block my-2">
                <code>{code.trim()}</code>
              </pre>
            </React.Fragment>
          );
        })}
        {text.substring(lastIndex)}
      </>
    );
  }

  // Handle inline code, bold, italic
  return processedText
    .split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .map((part, idx) => {
      if (!part) return null;

      // Code block
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        if (match) {
          const [, language, code] = match;
          return (
            <pre key={idx} className="message-code-block my-2">
              <code>{code.trim()}</code>
            </pre>
          );
        }
      }

      // Inline code
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="message-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={idx} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={idx}>{part}</span>;
    });
};

function MessageBubble({ message, isUser, isError = false, agentName = null, isHighlighted = false }) {
  const parsedContent = parseMarkdown(message);

  return (
    <div
      className={cn(
        "message-bubble",
        isError ? "message-error" : isUser ? "message-user" : "message-ai",
        isHighlighted && "message-bubble-highlighted"
      )}
    >
      {agentName && !isUser && (
        <p className="mb-2 text-xs font-medium text-slate-300 opacity-75">
          {agentName}
        </p>
      )}
      <div className="leading-relaxed text-sm whitespace-pre-wrap break-words">
        {parsedContent}
      </div>
    </div>
  );
}

export default MessageBubble;