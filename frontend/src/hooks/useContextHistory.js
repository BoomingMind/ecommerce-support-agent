/**
 * useContextHistory Hook
 * ======================
 * Manages session and long-term conversation history with metadata tracking.
 * Provides context injection and history retrieval functionality.
 */

import { useState, useCallback, useEffect, useRef } from "react";

const STORAGE_KEYS = {
  SESSION_HISTORY: "context-history-session-v1",
  LONG_TERM_HISTORY: "context-history-longterm-v1",
};

const DISPLAY_LIMIT = 50;

/**
 * Generates metadata for a message
 */
const generateMessageMetadata = (agentId, intentTag = null) => {
  return {
    agent_id: agentId,
    timestamp: new Date().toISOString(),
    intent_tag: intentTag,
  };
};

/**
 * Extracts intent from message text
 */
const extractIntent = (text) => {
  const intents = {
    order: /order|track|shipment|delivery/i,
    billing: /bill|charge|payment|invoice|credit card/i,
    refund: /refund|return|money back|compensation/i,
    product: /product|item|stock|availability|feature/i,
    account: /account|login|password|profile|settings/i,
    general: /help|question|support|issue/i,
  };

  for (const [tag, regex] of Object.entries(intents)) {
    if (regex.test(text)) return tag;
  }
  return "general";
};

/**
 * useContextHistory Hook
 * Manages conversation history with session and long-term storage
 */
export function useContextHistory() {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [longTermHistory, setLongTermHistory] = useState([]);
  const [contextChip, setContextChip] = useState(null);
  const historyRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      const longTerm = localStorage.getItem(STORAGE_KEYS.LONG_TERM_HISTORY);

      if (session) setSessionHistory(JSON.parse(session));
      if (longTerm) setLongTermHistory(JSON.parse(longTerm));
    } catch (err) {
      console.warn("Failed to load history:", err);
    }
  }, []);

  // Persist session history
  useEffect(() => {
    try {
      const sliced = sessionHistory.slice(-DISPLAY_LIMIT);
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(sliced));
    } catch (err) {
      console.warn("Failed to save session history:", err);
    }
  }, [sessionHistory]);

  // Persist long-term history
  useEffect(() => {
    try {
      const sliced = longTermHistory.slice(-500);
      localStorage.setItem(STORAGE_KEYS.LONG_TERM_HISTORY, JSON.stringify(sliced));
    } catch (err) {
      console.warn("Failed to save long-term history:", err);
    }
  }, [longTermHistory]);

  /**
   * Adds a message to history with metadata
   */
  const addToHistory = useCallback(
    (message, isUser, agentId = null) => {
      const intentTag = isUser ? extractIntent(message) : null;
      const metadata = generateMessageMetadata(agentId, intentTag);

      const historyEntry = {
        id: `msg-${Date.now()}-${Math.random()}`,
        text: message,
        isUser,
        metadata,
        createdAt: metadata.timestamp,
      };

      setSessionHistory((prev) => [...prev, historyEntry]);
      setLongTermHistory((prev) => [...prev, historyEntry]);

      return historyEntry;
    },
    []
  );

  /**
   * Finds messages related to current topic
   */
  const findContextualMessages = useCallback(
    (currentIntentTag, agentId = null, limit = 5) => {
      const allHistory = [...sessionHistory];
      const filtered = allHistory.filter((entry) => {
        const matches =
          entry.metadata?.intent_tag === currentIntentTag ||
          (agentId && entry.metadata?.agent_id === agentId);
        return matches && !entry.isUser;
      });

      return filtered.slice(-limit);
    },
    [sessionHistory]
  );

  /**
   * Gets recent messages by agent
   */
  const getMessagesByAgent = useCallback(
    (agentId, limit = 10) => {
      return sessionHistory
        .filter((entry) => entry.metadata?.agent_id === agentId)
        .slice(-limit);
    },
    [sessionHistory]
  );

  /**
   * Highlights context based on agent switch
   */
  const injectContextOnAgentSwitch = useCallback(
    (newAgentId, previousIntentTag) => {
      const contextMessages = findContextualMessages(previousIntentTag, newAgentId, 3);

      if (contextMessages.length > 0) {
        const topic = previousIntentTag || "conversation";
        setContextChip({
          topic: topic.charAt(0).toUpperCase() + topic.slice(1),
          messageCount: contextMessages.length,
          messages: contextMessages,
          agentId: newAgentId,
        });

        // Auto-hide context chip after 5 seconds
        setTimeout(() => setContextChip(null), 5000);
      }

      return contextMessages;
    },
    [findContextualMessages]
  );

  /**
   * Gets older history segments for infinite scroll
   */
  const fetchOlderSegments = useCallback((limit = 20) => {
    // In a real app, this would fetch from a backend
    // For now, return from long-term history
    return longTermHistory.slice(-limit * 2, -limit);
  }, [longTermHistory]);

  /**
   * Clears all history
   */
  const clearHistory = useCallback(() => {
    setSessionHistory([]);
    setLongTermHistory([]);
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.LONG_TERM_HISTORY);
  }, []);

  /**
   * Gets statistics about conversation
   */
  const getConversationStats = useCallback(() => {
    const agents = new Set(
      sessionHistory.map((e) => e.metadata?.agent_id).filter(Boolean)
    );
    const intents = new Set(
      sessionHistory.map((e) => e.metadata?.intent_tag).filter(Boolean)
    );

    return {
      totalMessages: sessionHistory.length,
      agentsUsed: Array.from(agents),
      intentsDetected: Array.from(intents),
      lastActiveAt: sessionHistory[sessionHistory.length - 1]?.createdAt,
    };
  }, [sessionHistory]);

  return {
    sessionHistory,
    longTermHistory,
    contextChip,
    addToHistory,
    findContextualMessages,
    getMessagesByAgent,
    injectContextOnAgentSwitch,
    fetchOlderSegments,
    clearHistory,
    getConversationStats,
  };
}

export default useContextHistory;
