import React, { useState } from 'react';
import { Search, Circle, Plus } from 'lucide-react';
import type { Conversation } from '../../types';

interface ConversationListPanelProps {
  conversations: Conversation[];
  selectedId: string | number | null;
  onSelect: (conversation: Conversation) => void;
  onCreate?: () => void;
  accentColor?: 'indigo' | 'emerald';
  loading?: boolean;
}

const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  conversations,
  selectedId,
  onSelect,
  onCreate,
  accentColor = 'indigo',
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.participantName.toLowerCase().includes(q) ||
      c.eventName.toLowerCase().includes(q) ||
      (c.subject?.toLowerCase().includes(q) ?? false) ||
      (c.lastMessagePreview ?? '').toLowerCase().includes(q)
    );
  });

  const selectedBg = accentColor === 'emerald' ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : 'bg-indigo-500/5 border-l-2 border-indigo-500';
  const unreadBadgeBg = accentColor === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500';
  const focusBorder = accentColor === 'emerald' ? 'focus:border-emerald-500/50' : 'focus:border-indigo-500/50';
  const btnGradient = accentColor === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500';
  const avatarGradient = accentColor === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500';

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/30">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          {onCreate && (
            <button
              onClick={onCreate}
              className={`p-1.5 rounded-lg bg-gradient-to-r ${btnGradient} text-white hover:opacity-90 transition-all`}
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className={`w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none ${focusBorder} transition-all`}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </p>
          </div>
        )}

        {filtered.map((convo) => (
          <button
            key={convo.id}
            onClick={() => onSelect(convo)}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all ${
              selectedId === convo.id
                ? selectedBg
                : 'hover:bg-slate-800/30 border-l-2 border-transparent'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold`}
              >
                {convo.participantAvatar || getInitials(convo.participantName)}
              </div>
              {/* Online indicator placeholder — always show for demo */}
              <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-emerald-500 text-slate-950" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate">{convo.participantName}</p>
                <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                  {formatTime(convo.lastMessageAt)}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{convo.eventName}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{convo.lastMessagePreview}</p>
            </div>

            {/* Unread badge */}
            {convo.unreadCount > 0 && (
              <span
                className={`${unreadBadgeBg} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-1`}
              >
                {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationListPanel;
