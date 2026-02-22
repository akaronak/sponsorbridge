import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../../types';
import ProposalCard from './ProposalCard';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  accentColor?: 'indigo' | 'emerald';
  showSender?: boolean;
  onAcceptProposal?: (messageId: string | number) => void;
  onRejectProposal?: (messageId: string | number) => void;
  onCounterProposal?: (messageId: string | number) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  accentColor = 'indigo',
  showSender = false,
  onAcceptProposal,
  onRejectProposal,
  onCounterProposal,
}) => {
  const isSystem = message.messageType === 'SYSTEM_EVENT';
  const isProposalType =
    message.messageType === 'PROPOSAL' ||
    message.messageType === 'COUNTER_OFFER' ||
    message.messageType === 'DEAL_ACCEPTED' ||
    message.messageType === 'DEAL_REJECTED';

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // System event — centered pill
  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="px-4 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full">
          <p className="text-xs text-slate-400 text-center">{message.content}</p>
        </div>
      </div>
    );
  }

  // Proposal / Counter-offer / Deal — card layout
  if (isProposalType) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className="max-w-[80%]">
          {showSender && !isOwn && (
            <p className="text-xs text-slate-500 mb-1 ml-1">{message.senderName}</p>
          )}
          <ProposalCard
            message={message}
            isOwn={isOwn}
            accentColor={accentColor}
            onAccept={onAcceptProposal}
            onReject={onRejectProposal}
            onCounter={onCounterProposal}
          />
          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'} px-1`}>
            <span className="text-[10px] text-slate-600">{formatTime(message.createdAt)}</span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    );
  }

  // Regular text message
  const ownBg =
    accentColor === 'emerald'
      ? 'bg-emerald-600 text-white rounded-br-md'
      : 'bg-indigo-600 text-white rounded-br-md';
  const otherBg = 'bg-slate-800 text-slate-200 rounded-bl-md';
  const ownTimeCls = accentColor === 'emerald' ? 'text-emerald-200' : 'text-indigo-200';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[70%]">
        {showSender && !isOwn && (
          <p className="text-xs text-slate-500 mb-1 ml-1">{message.senderName}</p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl ${isOwn ? ownBg : otherBg}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className={`flex items-center gap-1.5 justify-end mt-1`}>
            <span className={`text-[10px] ${isOwn ? ownTimeCls : 'text-slate-500'}`}>
              {formatTime(message.createdAt)}
            </span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Read-receipt status icon
const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'READ') {
    return <CheckCheck className="w-3 h-3 text-blue-400" />;
  }
  if (status === 'DELIVERED') {
    return <CheckCheck className="w-3 h-3 text-slate-400" />;
  }
  return <Check className="w-3 h-3 text-slate-500" />;
};

export default MessageBubble;
