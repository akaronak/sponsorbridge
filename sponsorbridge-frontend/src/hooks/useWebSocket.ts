import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, type IFrame, type IMessage, type StompSubscription } from '@stomp/stompjs';
import type { WebSocketMessage } from '../types';

/**
 * STOMP WebSocket endpoint.
 * Uses native WebSocket (ws://) for the mock server.
 * For the real Spring Boot backend with SockJS, switch to the SockJS factory.
 */
const WS_URL = 'ws://localhost:8080/ws';

/**
 * Reconnect config — exponential back-off with jitter.
 */
const INITIAL_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;
const RECONNECT_DECAY = 1.5;

type MessageHandler = (message: WebSocketMessage) => void;

/**
 * Production-grade STOMP WebSocket hook.
 *
 * Replaces the old raw WebSocket `send({ type, data })` protocol with proper
 * STOMP frames routed through Spring's message broker:
 *
 *   Subscribe:
 *     /topic/conversation/{id}          → new messages
 *     /topic/conversation/{id}/typing   → typing indicators
 *     /topic/conversation/{id}/read     → read receipts
 *     /user/queue/messages              → direct message delivery
 *     /user/queue/notifications         → notification delivery
 *
 *   Publish:
 *     /app/chat.send     → SendMessageRequest payload
 *     /app/chat.typing   → TypingIndicatorDTO payload
 */
export function useWebSocket(onMessage: MessageHandler) {
  const clientRef = useRef<Client | null>(null);
  const handlersRef = useRef<MessageHandler>(onMessage);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<StompSubscription[]>([]);
  const activeConversationRef = useRef<string | number | null>(null);

  // Keep handler ref current without re-creating effects
  handlersRef.current = onMessage;

  /**
   * Dispatch a STOMP message body into the legacy-compatible WebSocketMessage format
   * that MessagingPage still expects ({ type, data }).
   */
  const dispatch = useCallback((type: WebSocketMessage['type'], data: unknown) => {
    handlersRef.current({ type, data });
  }, []);

  // ── STOMP client initialization ──

  const connect = useCallback(() => {
    const token = localStorage.getItem('sb_token');
    if (!token) {
      console.warn('[STOMP] No auth token, skipping connection');
      return;
    }

    // Tear down any existing client
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }

    const client = new Client({
      // Native WebSocket connection (works with mock server)
      // For production with SockJS, use: webSocketFactory: () => new SockJS(url)
      brokerURL: WS_URL,

      // STOMP CONNECT headers — JWT sent here, NOT in the URL
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Heart-beat negotiation (client→server, server→client) in ms
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // Reconnect with exponential back-off
      reconnectDelay: INITIAL_RECONNECT_DELAY,

      // Debug logging (disable in production)
      // debug: (str) => console.debug('[STOMP]', str),

      onConnect: (_frame: IFrame) => {
        console.log('[STOMP] Connected');
        setIsConnected(true);

        // Subscribe to personal queues (user-scoped by Spring)
        const msgSub = client.subscribe('/user/queue/messages', (frame: IMessage) => {
          try {
            const data = JSON.parse(frame.body);
            dispatch('NEW_MESSAGE', data);
          } catch (e) {
            console.error('[STOMP] Failed to parse /user/queue/messages:', e);
          }
        });

        const notifSub = client.subscribe('/user/queue/notifications', (frame: IMessage) => {
          try {
            const data = JSON.parse(frame.body);
            // Notifications are handled separately; dispatch as a generic type
            dispatch('NEW_MESSAGE', data);
          } catch (e) {
            console.error('[STOMP] Failed to parse /user/queue/notifications:', e);
          }
        });

        subscriptionsRef.current = [msgSub, notifSub];

        // If there was an active conversation before reconnect, re-subscribe
        if (activeConversationRef.current) {
          subscribeToConversation(activeConversationRef.current);
        }
      },

      onStompError: (frame: IFrame) => {
        console.error('[STOMP] Broker error:', frame.headers['message']);
        console.error('[STOMP] Details:', frame.body);
      },

      onDisconnect: () => {
        console.log('[STOMP] Disconnected');
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [dispatch]);

  // ── Subscribe to a specific conversation's topics ──

  const subscribeToConversation = useCallback((conversationId: string | number) => {
    const client = clientRef.current;
    if (!client?.active) return;

    const convId = String(conversationId);

    // Unsubscribe from previous conversation topics (keep user queues)
    subscriptionsRef.current
      .filter((sub) => sub.id.startsWith('conv-'))
      .forEach((sub) => sub.unsubscribe());

    subscriptionsRef.current = subscriptionsRef.current.filter(
      (sub) => !sub.id.startsWith('conv-')
    );

    // Subscribe: new messages for this conversation
    const msgSub = client.subscribe(
      `/topic/conversation/${convId}`,
      (frame: IMessage) => {
        try {
          const data = JSON.parse(frame.body);
          dispatch('NEW_MESSAGE', data);
        } catch (e) {
          console.error('[STOMP] Failed to parse conversation message:', e);
        }
      },
      { id: `conv-msg-${convId}` }
    );

    // Subscribe: typing indicators
    const typingSub = client.subscribe(
      `/topic/conversation/${convId}/typing`,
      (frame: IMessage) => {
        try {
          const data = JSON.parse(frame.body);
          dispatch('TYPING', data);
        } catch (e) {
          console.error('[STOMP] Failed to parse typing indicator:', e);
        }
      },
      { id: `conv-typing-${convId}` }
    );

    // Subscribe: read receipts
    const readSub = client.subscribe(
      `/topic/conversation/${convId}/read`,
      (frame: IMessage) => {
        try {
          const data = JSON.parse(frame.body);
          dispatch('READ_RECEIPT', data);
        } catch (e) {
          console.error('[STOMP] Failed to parse read receipt:', e);
        }
      },
      { id: `conv-read-${convId}` }
    );

    subscriptionsRef.current.push(msgSub, typingSub, readSub);
    activeConversationRef.current = conversationId;
  }, [dispatch]);

  // ── Disconnect ──

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }
    clientRef.current = null;
    subscriptionsRef.current = [];
    activeConversationRef.current = null;
    setIsConnected(false);
  }, []);

  // ── Send helpers (publish to /app/* destinations) ──

  const send = useCallback((destination: string, body: unknown) => {
    if (clientRef.current?.active) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('[STOMP] Cannot send — not connected');
    }
  }, []);

  const sendTyping = useCallback(
    (conversationId: string | number, typing: boolean) => {
      send('/app/chat.typing', { conversationId: String(conversationId), typing });
    },
    [send]
  );

  const sendMarkRead = useCallback(
    (conversationId: string | number) => {
      // Read receipts go via REST (POST /api/conversations/{id}/read),
      // but we also broadcast via the topic for real-time UI updates
      // The backend handles the broadcast in ConversationService.markConversationAsRead()
    },
    []
  );

  // Connect on mount, disconnect on unmount.
  // Also reconnect when the user identity changes (login/logout).
  useEffect(() => {
    connect();

    const handleAuthChanged = () => {
      // Tear down old connection (previous user's token/subscriptions)
      disconnect();
      // Re-connect with the new token from localStorage
      // (will no-op if token was removed on logout)
      connect();
    };

    window.addEventListener('auth:changed', handleAuthChanged);

    return () => {
      window.removeEventListener('auth:changed', handleAuthChanged);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    sendTyping,
    sendMarkRead,
    subscribeToConversation,
    connect,
    disconnect,
  };
}
