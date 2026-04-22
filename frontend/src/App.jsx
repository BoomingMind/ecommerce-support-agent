/**
 * Customer Support Chat Application
 * =================================
 * A React-based chat interface for a multi-agent customer support system.
 * Features:
 * - Real-time streaming responses via Server-Sent Events (SSE)
 * - Agent status indicators showing which agent is processing
 * - Human-like typing delays for natural conversation feel
 *
 * Backend: FastAPI with LangGraph orchestration
 * Frontend: React + Vite + Tailwind CSS + ShadCN UI
 */

import { useState, useCallback } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import AgentStatus from "./components/AgentStatus";

// API configuration
const API_URL = "http://127.0.0.1:8000";

// Mapping of agent categories to frontend display names
// Used to show which specialist agent is handling the query
const AGENT_CATEGORY_MAP = {
  billing: "billing",
  refund: "refund",
  general: "general",
};

/**
 * Main Application Component
 * Manages chat state, message handling, and streaming responses
 */
function App() {
  // Chat messages array - each message has text content and isUser flag
  const [messages, setMessages] = useState([]);

  // Loading state - true while waiting for agent response
  const [isLoading, setIsLoading] = useState(false);

  // Current active agent - displayed in the header status badge
  const [currentAgent, setCurrentAgent] = useState(null);

  /**
   * Handles sending a message and processing the streaming response
   *
   * Flow:
   * 1. Add user's message to chat immediately
   * 2. Set loading state and show triage agent
   * 3. Connect to SSE stream from backend
   * 4. Receive response word-by-word with natural delays
   * 5. Update chat in real-time as chunks arrive
   *
   * @param {string} text - The user's input message
   */
  const handleSend = useCallback(async (text) => {
    // Step 1: Add user's message to chat immediately for instant feedback
    setMessages((prev) => [...prev, { text, isUser: true }]);

    // Step 2: Set loading state - this shows typing indicator
    setIsLoading(true);

    // Show triage agent as the first responder
    setCurrentAgent("triage");

    try {
      // Step 3: Connect to the streaming endpoint
      // Using EventSource for Server-Sent Events (SSE)
      const encodedQuery = encodeURIComponent(text);
      const eventSource = new EventSource(`${API_URL}/api/stream/${encodedQuery}`);

      // Variable to accumulate the full response as chunks arrive
      let fullResponse = "";

      // Initialize the AI message with empty text
      // We'll update it as streaming chunks arrive
      setMessages((prev) => [...prev, { text: "", isUser: false }]);

      // Step 4: Handle incoming stream events
      eventSource.onmessage = (event) => {
        // Parse the SSE data (format: {"chunk": "...", "done": false})
        const data = JSON.parse(event.data);

        // Accumulate the response text
        fullResponse += data.chunk;

        // Update the last message (AI response) with accumulated text
        // This creates the effect of the agent typing in real-time
        setMessages((prev) => {
          const updated = [...prev];
          // Only update if the last message is the AI response we're building
          if (updated.length > 0 && !updated[updated.length - 1].isUser) {
            updated[updated.length - 1] = { text: fullResponse, isUser: false };
          }
          return updated;
        });

        // Step 5: Check if stream is complete
        if (data.done) {
          // Clean up EventSource connection
          eventSource.close();

          // Update agent status based on the response category
          // This maps the backend category to the appropriate specialist agent badge
          const categoryMatch = fullResponse.toLowerCase();
          if (categoryMatch.includes("billing")) {
            setCurrentAgent("billing");
          } else if (categoryMatch.includes("refund")) {
            setCurrentAgent("refund");
          } else {
            setCurrentAgent("general");
          }

          // Clear loading state after a short delay
          // The delay lets the user see the final response before removing typing indicator
          setTimeout(() => {
            setIsLoading(false);
            setCurrentAgent(null);
          }, 300);
        }
      };

      // Handle any errors in the EventSource connection
      eventSource.onerror = (error) => {
        console.error("Stream error:", error);
        eventSource.close();

        // Show error message in chat
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && !updated[updated.length - 1].isUser) {
            updated[updated.length - 1] = {
              text: "Sorry, I encountered an error. Please try again.",
              isUser: false,
            };
          }
          return updated;
        });

        setIsLoading(false);
        setCurrentAgent(null);
      };

    } catch (error) {
      // Handle any unexpected errors
      console.error("Request error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Something went wrong. Please try again.", isUser: false },
      ]);
      setIsLoading(false);
      setCurrentAgent(null);
    }
  }, []); // Empty dependency array - function is recreated only on mount

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    // Main container - full viewport height with flex column layout
    <div className="flex flex-col h-screen bg-white">

      {/* Header - fixed at top, shows title and agent status */}
      <header className="flex-shrink-0 border-b border-neutral-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left side - App title */}
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              E-Commerce AI Customer Support Agent
            </h1>
            <p className="text-xs text-neutral-500">
              Built by Syed Sarim Abbas
            </p>
          </div>

          {/* Right side - Agent status indicator */}
          {/* Shows which specialist agent is currently handling the query */}
          <AgentStatus currentAgent={currentAgent} />
        </div>
      </header>

      {/* Chat window - takes remaining vertical space */}
      <ChatWindow messages={messages} isTyping={isLoading} />

      {/* Footer - fixed at bottom, contains the input box */}
      <footer className="flex-shrink-0 border-t border-neutral-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <InputBox onSend={handleSend} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
}

export default App;