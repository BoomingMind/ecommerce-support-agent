import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import AgentStatus from "./components/AgentStatus";
import AgentSidebar from "./components/AgentSidebar";
import ContextBridge from "./components/ContextBridge";
import MemoryIndicator from "./components/MemoryIndicator";
import { fetchAgentManifest } from "./services/api";
import { openChatStream } from "./utils/sseChat";
import { useContextHistory } from "./hooks/useContextHistory";

const STORAGE_KEY = "support-chat-history-v1";

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [previousIntentTag, setPreviousIntentTag] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isAgentListLoading, setIsAgentListLoading] = useState(true);
  const [lastQuery, setLastQuery] = useState("");
  const [highlightedMessageIds, setHighlightedMessageIds] = useState([]);
  const streamRef = useRef(null);
  const messageIdRef = useRef(0);

  // Context history hook
  const {
    sessionHistory,
    addToHistory,
    findContextualMessages,
    injectContextOnAgentSwitch,
    fetchOlderSegments,
    contextChip,
  } = useContextHistory();

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
      const userMsg = createMessage(query, true);

      // Add to context history
      addToHistory(query, true, "user");

      setMessages((prev) => [
        ...prev,
        userMsg,
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
          setMessages((prev) => {
            const aiMsg = prev.find((m) => m.id === aiMessageId);
            if (aiMsg) {
              addToHistory(aiMsg.text, false, currentAgent);
            }
            return prev;
          });
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
    [createMessage, isLoading, currentAgent, addToHistory]
  );

  const retryLastQuery = useCallback(() => {
    if (lastQuery && !isLoading) {
      sendMessage(lastQuery);
    }
  }, [isLoading, lastQuery, sendMessage]);

  // Handle agent switch with context injection
  useEffect(() => {
    if (currentAgent && previousIntentTag) {
      const contextMsgs = injectContextOnAgentSwitch(currentAgent, previousIntentTag);
      // Highlight the contextual messages
      const ids = contextMsgs.map((msg) => msg.id);
      setHighlightedMessageIds(ids);
      setTimeout(() => setHighlightedMessageIds([]), 3000);
    }
    setPreviousIntentTag(
      messages
        .filter((m) => !m.isUser)
        .slice(-1)[0]?.metadata?.intent_tag || null
    );
  }, [currentAgent, injectContextOnAgentSwitch, messages]);

  const handleScrollUp = useCallback(
    (onComplete) => {
      // Fetch older segments from history
      const older = fetchOlderSegments(10);
      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
      }
      onComplete?.();
    },
    [fetchOlderSegments]
  );

  return (
    <div className="page-fade-in h-screen w-screen overflow-hidden">
      <div className="relative flex h-full w-full flex-col">
        {/* Navigation Rail (Collapsed Sidebar) */}
        <AgentSidebar
          agents={agents}
          activeAgentId={currentAgent}
          isLoadingAgents={isAgentListLoading}
        />

        {/* Main Content Area */}
        <main className="ml-20 mr-80 flex flex-1 flex-col">
          {/* Minimalist Header with Agent Status */}
          <header className="border-b border-white/10 bg-surface-glass/30 backdrop-blur-glass px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold text-slate-100">
                  Support Dashboard
                </h1>
                <p className="text-xs text-slate-400">
                  Multi-agent orchestration in real-time
                </p>
              </div>
              <AgentStatus currentAgent={currentAgent} />
            </div>
          </header>

          {/* Memory Indicator Chip */}
          <MemoryIndicator contextChip={contextChip} />

          {/* Chat Terminal - Full Height */}
          <ChatWindow
            messages={messages}
            isTyping={isLoading}
            onRetry={retryLastQuery}
            activeAgentName={activeAgentName}
            onScrollUp={handleScrollUp}
            highlightedMessageIds={highlightedMessageIds}
          />

          {/* Floating Input */}
          <InputBox onSend={sendMessage} isLoading={isLoading} />
        </main>

        {/* Context History Sidebar */}
        <aside className="fixed right-0 top-0 h-screen w-80 border-l border-white/10 bg-surface-glass/40 backdrop-blur-glass overflow-y-auto custom-scrollbar flex flex-col z-35">
          <div className="flex-1 overflow-y-auto">
            <ContextBridge
              history={sessionHistory}
              onSelectContext={(entry) => {
                // Can implement context selection logic here
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;