import { useEffect, useRef, useCallback, useState } from 'react';
import type { WebSocketMessage } from '../types';

const WS_URL = 'ws://localhost:8080/ws';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL = 30000;

type MessageHandler = (message: WebSocketMessage) => void;

/**
 * WebSocket hook for real-time messaging.
 * Handles connection lifecycle, authentication, reconnection, and heartbeat.
 */
export function useWebSocket(onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();
  const pingInterval = useRef<ReturnType<typeof setInterval>>();
  const handlersRef = useRef<MessageHandler>(onMessage);
  const [isConnected, setIsConnected] = useState(false);

  // Keep handler ref current
  handlersRef.current = onMessage;

  const connect = useCallback(() => {
    const token = localStorage.getItem('sb_token');
    if (!token) {
      console.warn('[WS] No auth token, skipping connection');
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Start heartbeat
        pingInterval.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING', data: {} }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handlersRef.current(message);
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log(`[WS] Disconnected (code: ${event.code})`);
        setIsConnected(false);
        wsRef.current = null;

        if (pingInterval.current) {
          clearInterval(pingInterval.current);
        }

        // Auto-reconnect (unless auth error or intentional close)
        if (event.code !== 1000 && event.code !== 4001) {
          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts.current);
            console.log(`[WS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts.current + 1})`);
            reconnectTimeout.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            console.error('[WS] Max reconnect attempts reached');
          }
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((type: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.warn('[WS] Cannot send — not connected');
    }
  }, []);

  const sendTyping = useCallback((conversationId: string | number, typing: boolean) => {
    send('TYPING', { conversationId, typing });
  }, [send]);

  const sendMarkRead = useCallback((conversationId: string | number) => {
    send('MARK_READ', { conversationId });
  }, [send]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    sendTyping,
    sendMarkRead,
    connect,
    disconnect,
  };
}
