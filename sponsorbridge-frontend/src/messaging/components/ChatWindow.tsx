import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MoreVertical, Calendar, ArrowDown } from 'lucide-react';
import type { Message, Conversation, SendMessagePayload, TypingIndicator as TI } from '../../types';
import { messagesApi } from '../../api/messages';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  accentColor?: 'indigo' | 'emerald';
  typingUser?: TI | null;
  incomingMessages?: Message[];
  onSendMessage?: (msg: Message) => void;
  onTyping?: (conversationId: string | number, typing: boolean) => void;
  onMarkRead?: (conversationId: string | number) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  accentColor = 'indigo',
  typingUser = null,
  incomingMessages = [],
  onSendMessage,
  onTyping,
  onMarkRead,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevConvoIdRef = useRef<string | number | null>(null);

  const avatarGradient = accentColor === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500';

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversation?.id) return;
    if (prevConvoIdRef.current === conversation.id) return;
    prevConvoIdRef.current = conversation.id;

    let cancelled = false;
    setLoading(true);

    messagesApi
      .getMessages(conversation.id)
      .then((data) => {
        if (!cancelled) {
          setMessages(data);
          // Mark read
          if (onMarkRead) onMarkRead(conversation.id);
        }
      })
      .catch((err) => console.error('Failed to load messages:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversation?.id, onMarkRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUser]);

  // Detect scroll position for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message (optimistic UI)
  const handleSend = async (payload: SendMessagePayload) => {
    // Optimistic message — derive senderRole from conversation participant data
    const senderRole = conversation.participantRole === 'ORGANIZER' ? 'COMPANY' : 'ORGANIZER';
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      senderName: 'You',
      senderRole,
      messageType: payload.messageType || 'TEXT',
      content: payload.content,
      status: 'SENT',
      proposalAmount: payload.proposalAmount,
      sponsorshipType: payload.sponsorshipType,
      proposalTerms: payload.proposalTerms,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await messagesApi.sendMessage(conversation.id, payload);
      // Replace optimistic with server response
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      );
      if (onSendMessage) onSendMessage(saved);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Mark optimistic as failed (keep it visible)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id ? { ...m, status: 'SENT' as const } : m
        )
      );
    }
  };

  // Handle typing notification
  const handleTyping = (typing: boolean) => {
    if (onTyping) onTyping(conversation.id, typing);
  };

  // Merge incoming real-time messages
  useEffect(() => {
    if (incomingMessages.length === 0) return;
    setMessages((prev) => {
      const existing = new Set(prev.map((m) => String(m.id)));
      const newMsgs = incomingMessages.filter((m) => !existing.has(String(m.id)));
      if (newMsgs.length === 0) return prev;
      return [...prev, ...newMsgs];
    });
  }, [incomingMessages]);

  // ── Proposal action handlers ──
  const handleAcceptProposal = useCallback(
    async (messageId: string | number) => {
      try {
        const payload: SendMessagePayload = {
          content: 'Deal accepted! Looking forward to our partnership.',
          messageType: 'DEAL_ACCEPTED',
          parentMessageId: messageId,
        };
        await handleSend(payload);
      } catch (err) {
        console.error('Failed to accept proposal:', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversation.id]
  );

  const handleRejectProposal = useCallback(
    async (messageId: string | number) => {
      try {
        const payload: SendMessagePayload = {
          content: 'We have decided not to proceed with this proposal.',
          messageType: 'DEAL_REJECTED',
          parentMessageId: messageId,
        };
        await handleSend(payload);
      } catch (err) {
        console.error('Failed to reject proposal:', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversation.id]
  );

  const handleCounterProposal = useCallback(
    (_messageId: string | number) => {
      // TODO: Open a counter-proposal modal/form
      // For now, this is a placeholder — the UI should present a form
      console.log('Counter proposal requested for message:', _messageId);
    },
    []
  );

  // Date separator helper
  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const renderMessages = () => {
    let lastDate = '';
    const elements: React.ReactNode[] = [];

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        elements.push(
          <div key={`date-${msgDate}`} className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {getDateLabel(msg.createdAt)}
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        );
      }

      elements.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={String(msg.senderId) === String(currentUserId)}
          accentColor={accentColor}
          onAcceptProposal={handleAcceptProposal}
          onRejectProposal={handleRejectProposal}
          onCounterProposal={handleCounterProposal}
        />
      );
    });

    return elements;
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold`}
          >
            {conversation.participantAvatar || getInitials(conversation.participantName)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{conversation.participantName}</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-slate-500" />
              <p className="text-xs text-slate-500">{conversation.eventName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation.status && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                conversation.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : conversation.status === 'CLOSED'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {conversation.status}
            </span>
          )}
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 relative"
      >
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-lg font-bold mb-4 opacity-50`}
            >
              {getInitials(conversation.participantName)}
            </div>
            <p className="text-slate-400 text-sm mb-1">
              Start a conversation with{' '}
              <span className="text-white font-medium">{conversation.participantName}</span>
            </p>
            <p className="text-slate-500 text-xs">
              About: {conversation.eventName}
            </p>
          </div>
        )}

        {renderMessages()}

        {/* Typing indicator */}
        {typingUser && typingUser.typing && (
          <TypingIndicator userName={typingUser.userName} accentColor={accentColor} />
        )}

        <div ref={messagesEndRef} />

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 right-8 p-2 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg z-10"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        accentColor={accentColor}
        disabled={conversation.status === 'CLOSED'}
      />
    </div>
  );
};

export default ChatWindow;
