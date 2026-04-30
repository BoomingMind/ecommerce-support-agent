import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import AgentStatus from "./components/AgentStatus";
import AgentSidebar from "./components/AgentSidebar";
import { fetchAgentManifest } from "./services/api";
import { openChatStream } from "./utils/sseChat";

const STORAGE_KEY = "support-chat-history-v1";

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isAgentListLoading, setIsAgentListLoading] = useState(true);
  const [lastQuery, setLastQuery] = useState("");
  const streamRef = useRef(null);
  const messageIdRef = useRef(0);

  const createMessage = useCallback((text, isUser, isError = false) => {
    messageIdRef.current += 1;
    return { id: messageIdRef.current, text, isUser, isError };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore corrupted local storage and start fresh.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
  }, [messages]);

  useEffect(() => {
    const loadAgents = async () => {
      setIsAgentListLoading(true);
      try {
        const manifest = await fetchAgentManifest();
        setAgents(manifest);
      } catch {
        setAgents([]);
      } finally {
        setIsAgentListLoading(false);
      }
    };

    loadAgents();
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.close();
    };
  }, []);

  const activeAgentName = useMemo(() => {
    if (!currentAgent) return null;
    const normalized = currentAgent.toLowerCase();
    const fromManifest = agents.find((agent) => agent.id?.toLowerCase() === normalized);
    return fromManifest?.name || currentAgent;
  }, [agents, currentAgent]);

  const sendMessage = useCallback(
    (text) => {
      const query = text.trim();
      if (!query || isLoading) return;

      streamRef.current?.close();
      setLastQuery(query);
      setIsLoading(true);
      setCurrentAgent("triage");

      const aiMessageId = `ai-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        createMessage(query, true),
        { id: aiMessageId, text: "", isUser: false, isError: false },
      ]);

      streamRef.current = openChatStream(query, {
        onMeta: (payload) => {
          if (payload?.category) {
            setCurrentAgent(payload.category);
          }
        },
        onChunk: (chunkText) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiMessageId
                ? { ...message, text: `${message.text}${chunkText}` }
                : message
            )
          );
        },
        onDone: () => {
          setIsLoading(false);
          setCurrentAgent(null);
        },
        onError: (errorText) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiMessageId
                ? {
                    ...message,
                    text: errorText || "Sorry, I encountered an error.",
                    isError: true,
                  }
                : message
            )
          );
          setIsLoading(false);
          setCurrentAgent(null);
        },
      });
    },
    [createMessage, isLoading]
  );

  const retryLastQuery = useCallback(() => {
    if (lastQuery && !isLoading) {
      sendMessage(lastQuery);
    }
  }, [isLoading, lastQuery, sendMessage]);

  return (
    <div className="page-fade-in">
      <div className="flex h-screen flex-col text-slate-50">
        <header className="glass-surface border-b">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">E-Commerce AI Support</h1>
              <p className="text-xs text-slate-400">
                Real-time multi-agent customer support
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AgentStatus currentAgent={currentAgent} />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <AgentSidebar
            agents={agents}
            activeAgentId={currentAgent}
            isLoadingAgents={isAgentListLoading}
          />

          <main className="flex min-h-0 flex-1 flex-col">
            <div className="agent-switch glass-surface border-b px-4 py-2 text-xs text-slate-300">
              {activeAgentName ? `Active agent: ${activeAgentName}` : "No active agent"}
            </div>

            <ChatWindow
              messages={messages}
              isTyping={isLoading}
              onRetry={retryLastQuery}
              activeAgentName={activeAgentName}
            />

            <footer className="floating-input glass-surface focus-glow">
              <InputBox onSend={sendMessage} isLoading={isLoading} />
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;