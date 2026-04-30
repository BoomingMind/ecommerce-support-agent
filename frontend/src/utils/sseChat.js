import { getApiBaseUrl } from "../services/api";

export function openChatStream(query, handlers) {
  let eventSource = null;
  let closedByClient = false;
  let streamFinished = false;
  let errorHandled = false;

  const stopStream = () => {
    closedByClient = true;
    eventSource?.close();
  };

  const start = () => {
    if (closedByClient) return;

    const encodedQuery = encodeURIComponent(query);
    eventSource = new EventSource(`${getApiBaseUrl()}/api/stream?query=${encodedQuery}`);

    eventSource.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      if (payload.type === "meta") {
        handlers.onMeta?.(payload);
        return;
      }

      if (payload.type === "error" || payload.error === true) {
        streamFinished = true;
        stopStream();
        handlers.onError?.(payload?.message || "Something went wrong while streaming.");
        return;
      }

      if (payload.type === "done" || payload.done === true) {
        streamFinished = true;
        stopStream();
        handlers.onDone?.(payload);
        return;
      }

      if (payload.type === "chunk" || typeof payload.chunk === "string") {
        handlers.onChunk?.(payload.chunk || "");
      }
    };

    eventSource.onerror = () => {
      eventSource?.close();

      // Ignore error/close signals after normal completion.
      if (closedByClient || streamFinished || errorHandled) return;

      errorHandled = true;
      streamFinished = true;
      stopStream();
      handlers.onError?.("Connection lost. Please retry.");
    };
  };

  start();

  return {
    close() {
      stopStream();
    },
  };
}
