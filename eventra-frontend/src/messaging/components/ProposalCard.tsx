import React from 'react';
import { DollarSign, Clock, FileText, Gift, CheckCircle, XCircle } from 'lucide-react';
import type { Message } from '../../types';

interface ProposalCardProps {
  message: Message;
  isOwn: boolean;
  accentColor?: 'indigo' | 'emerald';
  onAccept?: (messageId: string | number) => void;
  onReject?: (messageId: string | number) => void;
  onCounter?: (messageId: string | number) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  message,
  isOwn,
  accentColor = 'indigo',
  onAccept,
  onReject,
  onCounter,
}) => {
  const isProposal = message.messageType === 'PROPOSAL';
  const isCounter = message.messageType === 'COUNTER_OFFER';
  const isAccepted = message.messageType === 'DEAL_ACCEPTED';
  const isRejected = message.messageType === 'DEAL_REJECTED';

  const borderColor = isAccepted
    ? 'border-emerald-500/30'
    : isRejected
    ? 'border-red-500/30'
    : isCounter
    ? 'border-amber-500/30'
    : accentColor === 'emerald'
    ? 'border-emerald-500/30'
    : 'border-indigo-500/30';

  const headerBg = isAccepted
    ? 'from-emerald-500/20 to-emerald-500/5'
    : isRejected
    ? 'from-red-500/20 to-red-500/5'
    : isCounter
    ? 'from-amber-500/20 to-amber-500/5'
    : accentColor === 'emerald'
    ? 'from-emerald-500/20 to-emerald-500/5'
    : 'from-indigo-500/20 to-indigo-500/5';

  const label = isAccepted
    ? 'Deal Accepted'
    : isRejected
    ? 'Deal Rejected'
    : isCounter
    ? 'Counter Offer'
    : 'Sponsorship Proposal';

  const labelIcon = isAccepted ? (
    <CheckCircle className="w-4 h-4 text-emerald-400" />
  ) : isRejected ? (
    <XCircle className="w-4 h-4 text-red-400" />
  ) : (
    <FileText className="w-4 h-4 text-slate-400" />
  );

  return (
    <div className={`rounded-xl border ${borderColor} bg-slate-900/80 overflow-hidden max-w-sm`}>
      {/* Header */}
      <div className={`px-4 py-2.5 bg-gradient-to-r ${headerBg} flex items-center gap-2`}>
        {labelIcon}
        <span className="text-xs font-semibold text-white uppercase tracking-wide">{label}</span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Amount */}
        {message.proposalAmount != null && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-lg font-bold text-white">
              ${message.proposalAmount.toLocaleString()}
            </span>
            {message.sponsorshipType && (
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full ml-auto">
                {message.sponsorshipType}
              </span>
            )}
          </div>
        )}

        {/* Terms */}
        {message.proposalTerms && (
          <div className="text-sm text-slate-300 leading-relaxed">
            {message.proposalTerms}
          </div>
        )}

        {/* Goodies */}
        {message.goodiesDescription && (
          <div className="flex items-start gap-2">
            <Gift className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-400">{message.goodiesDescription}</span>
          </div>
        )}

        {/* Deadline */}
        {message.proposalDeadline && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">
              Expires: {new Date(message.proposalDeadline).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Content / note */}
        {message.content && (
          <p className="text-sm text-slate-400 border-t border-slate-800 pt-2 mt-2">
            {message.content}
          </p>
        )}

        {/* Action Buttons (only for received proposals/counter-offers) */}
        {!isOwn && (isProposal || isCounter) && !isAccepted && !isRejected && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            {onAccept && (
              <button
                onClick={() => onAccept(message.id)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all"
              >
                Accept
              </button>
            )}
            {onCounter && (
              <button
                onClick={() => onCounter(message.id)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all"
              >
                Counter
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject(message.id)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Decline
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;
