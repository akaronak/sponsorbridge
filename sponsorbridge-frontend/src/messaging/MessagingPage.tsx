import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import type { Conversation, Message, TypingIndicator as TI, WebSocketMessage } from '../types';
import { messagesApi } from '../api/messages';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import ConversationListPanel from './components/ConversationListPanel';
import ChatWindow from './components/ChatWindow';

interface MessagingPageProps {
  /** 'indigo' for organizer, 'emerald' for company */
  accentColor?: 'indigo' | 'emerald';
}

/**
 * Full messaging page shared between Organizer and Company dashboards.
 * Handles conversation list, chat window, and WebSocket real-time updates.
 */
const MessagingPage: React.FC<MessagingPageProps> = ({ accentColor = 'indigo' }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Map<string | number, TI>>(new Map());
  const [realtimeQueue, setRealtimeQueue] = useState<Message[]>([]);

  const currentUserId = user?.id || '';

  // ── WebSocket message handler ──
  const handleWsMessage = useCallback(
    (wsMsg: WebSocketMessage) => {
      switch (wsMsg.type) {
        case 'NEW_MESSAGE': {
          const msg = wsMsg.data as Message;
          // Update conversation list preview
          setConversations((prev) =>
            prev.map((c) =>
              String(c.id) === String(msg.conversationId)
                ? {
                    ...c,
                    lastMessagePreview: msg.content || 'Proposal',
                    lastMessageAt: msg.createdAt,
                    unreadCount:
                      String(msg.senderId) !== String(currentUserId)
                        ? c.unreadCount + 1
                        : c.unreadCount,
                  }
                : c
            )
          );
          // If this message belongs to the selected conversation, queue it
          if (selectedConvo && String(msg.conversationId) === String(selectedConvo.id)) {
            if (String(msg.senderId) !== String(currentUserId)) {
              setRealtimeQueue((prev) => [...prev, msg]);
            }
          }
          break;
        }

        case 'TYPING': {
          const indicator = wsMsg.data as TI;
          if (String(indicator.userId) === String(currentUserId)) return;
          setTypingUsers((prev) => {
            const next = new Map(prev);
            if (indicator.typing) {
              next.set(indicator.conversationId, indicator);
              // Auto-clear after 3s
              setTimeout(() => {
                setTypingUsers((p) => {
                  const n = new Map(p);
                  n.delete(indicator.conversationId);
                  return n;
                });
              }, 3000);
            } else {
              next.delete(indicator.conversationId);
            }
            return next;
          });
          break;
        }

        case 'READ_RECEIPT': {
          // Could update message statuses here
          break;
        }

        default:
          break;
      }
    },
    [currentUserId, selectedConvo]
  );

  const { isConnected, sendTyping, sendMarkRead, subscribeToConversation } = useWebSocket(handleWsMessage);

  // ── Subscribe to selected conversation's STOMP topics ──
  useEffect(() => {
    if (selectedConvo && isConnected) {
      subscribeToConversation(selectedConvo.id);
    }
  }, [selectedConvo?.id, isConnected, subscribeToConversation]);

  // ── Load conversations (re-fetch when the authenticated user changes) ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Reset stale state from previous user
    setConversations([]);
    setSelectedConvo(null);
    setRealtimeQueue([]);
    setTypingUsers(new Map());

    messagesApi
      .getConversations()
      .then((data) => {
        if (!cancelled) {
          setConversations(data);
          // Auto-select first conversation
          if (data.length > 0) {
            setSelectedConvo(data[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load conversations:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // ── Select conversation ──
  const handleSelectConvo = (convo: Conversation) => {
    setSelectedConvo(convo);
    // Reset unread for this conversation
    setConversations((prev) =>
      prev.map((c) => (c.id === convo.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // ── Typing handler ──
  const handleTyping = useCallback(
    (conversationId: string | number, typing: boolean) => {
      sendTyping(conversationId, typing);
    },
    [sendTyping]
  );

  // ── Mark read ──
  const handleMarkRead = useCallback(
    (conversationId: string | number) => {
      sendMarkRead(conversationId);
      messagesApi.markAsRead(conversationId).catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    },
    [sendMarkRead]
  );

  // ── Handle new sent message (update conversation list) ──
  const handleSentMessage = useCallback((msg: Message) => {
    setConversations((prev) =>
      prev.map((c) =>
        String(c.id) === String(msg.conversationId)
          ? {
              ...c,
              lastMessagePreview: msg.content || 'Proposal',
              lastMessageAt: msg.createdAt,
            }
          : c
      )
    );
  }, []);

  const typingForSelected = selectedConvo
    ? typingUsers.get(selectedConvo.id) || null
    : null;

  const gradientFrom = accentColor === 'emerald' ? 'from-emerald-500' : 'from-indigo-500';
  const gradientTo = accentColor === 'emerald' ? 'to-teal-500' : 'to-purple-500';

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Conversation List */}
      <ConversationListPanel
        conversations={conversations}
        selectedId={selectedConvo?.id ?? null}
        onSelect={handleSelectConvo}
        accentColor={accentColor}
        loading={loading}
      />

      {/* Chat Area */}
      {selectedConvo ? (
        <ChatWindow
          conversation={selectedConvo}
          currentUserId={currentUserId}
          accentColor={accentColor}
          typingUser={typingForSelected}
          incomingMessages={realtimeQueue}
          onSendMessage={handleSentMessage}
          onTyping={handleTyping}
          onMarkRead={handleMarkRead}
        />
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center mb-4 opacity-30`}
          >
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {loading ? 'Loading…' : 'Select a conversation'}
          </h3>
          <p className="text-sm text-slate-500 max-w-xs text-center">
            {loading
              ? ''
              : 'Choose a conversation from the sidebar to start messaging, or create a new one.'}
          </p>
          {!isConnected && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Reconnecting to real-time server…
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
