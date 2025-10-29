import { useEffect, useRef, useState } from 'react';

type WSMessage = {
  type: string;
  chat_id?: string;
  message_id?: string;
  sender_id?: string;
  content?: string;
  created_at?: string;
  data?: any;
};

type MessageHandler = (message: WSMessage) => void;

// Build a proper WS base URL from the HTTP(S) API URL
function buildWsBaseUrl(): string {
  const api = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!api) return 'ws://localhost:8088';
  try {
    const u = new URL(api);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    // Return just the origin (protocol + host + optional port)
    return u.origin;
  } catch {
    // Fallback: simple replace if the URL was not fully qualified
    return api.replace(/^https?/, (m) => (m === 'https' ? 'wss' : 'ws'));
  }
}

const WS_BASE = buildWsBaseUrl();

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, MessageHandler[]>>(new Map());

  // Use browser-safe timeout types
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);

  const clearReconnectTimer = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Avoid opening a new socket unless the previous one is fully closed
    const ready = wsRef.current?.readyState;
    if (ready === WebSocket.OPEN || ready === WebSocket.CONNECTING || ready === WebSocket.CLOSING) {
      return;
    }

    const ws = new WebSocket(`${WS_BASE}/ws?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      // console.debug('WebSocket connected');
      setIsConnected(true);
      clearReconnectTimer();
    };

    ws.onmessage = async (event) => {
      try {
        // Support both string and Blob payloads
        const raw = typeof event.data === 'string' ? event.data : await (event.data as Blob).text();
        const message: WSMessage = JSON.parse(raw);

        // Call handlers for the specific type
        const handlers = handlersRef.current.get(message.type) || [];
        handlers.forEach((h) => h(message));

        // And wildcard handlers
        const wildcardHandlers = handlersRef.current.get('*') || [];
        wildcardHandlers.forEach((h) => h(message));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      // console.debug('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      if (shouldReconnectRef.current) {
        clearReconnectTimer();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (shouldReconnectRef.current) {
            // console.debug('Attempting to reconnect...');
            connect();
          }
        }, 3000);
      }
    };

    wsRef.current = ws;
  };

  const disconnect = () => {
    shouldReconnectRef.current = false;
    clearReconnectTimer();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Component unmounting');
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      // If still connecting, just null it; browser will fire onclose later
      try {
        wsRef.current.close();
      } catch { /* noop */ }
    }
    wsRef.current = null;
    setIsConnected(false);
  };

  const send = (message: WSMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected; message not sent:', message);
    }
  };

  const on = (type: string, handler: MessageHandler) => {
    const map = handlersRef.current;
    const list = map.get(type) ? [...(map.get(type) as MessageHandler[])] : [];
    list.push(handler);
    map.set(type, list);

    // Cleanup unsubscribes this handler
    return () => {
      const current = map.get(type);
      if (!current) return;
      const next = current.filter((h) => h !== handler);
      if (next.length === 0) {
        map.delete(type);
      } else {
        map.set(type, next);
      }
    };
  };

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();
    return () => {
      disconnect();
      // Also clear all handlers on unmount to avoid leaks
      handlersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isConnected, send, on };
};
