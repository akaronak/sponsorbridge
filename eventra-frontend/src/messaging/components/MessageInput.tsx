import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  DollarSign,
  X,
} from 'lucide-react';
import type { SendMessagePayload, MessageType } from '../../types';

interface MessageInputProps {
  onSend: (payload: SendMessagePayload) => void;
  onTyping?: (typing: boolean) => void;
  accentColor?: 'indigo' | 'emerald';
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  accentColor = 'indigo',
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalAmount, setProposalAmount] = useState('');
  const [sponsorshipType, setSponsorshipType] = useState('');
  const [proposalTerms, setProposalTerms] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const btnBg = accentColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700';
  const borderFocus = accentColor === 'emerald' ? 'focus-within:border-emerald-500/50' : 'focus-within:border-indigo-500/50';

  // Typing indicator
  const handleInputChange = (value: string) => {
    setContent(value);
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [content]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed && !showProposalForm) return;

    const payload: SendMessagePayload = { content: trimmed };

    if (showProposalForm && proposalAmount) {
      payload.messageType = 'PROPOSAL' as MessageType;
      payload.proposalAmount = parseFloat(proposalAmount);
      payload.sponsorshipType = sponsorshipType || undefined;
      payload.proposalTerms = proposalTerms || undefined;
    }

    onSend(payload);
    setContent('');
    setShowProposalForm(false);
    setProposalAmount('');
    setSponsorshipType('');
    setProposalTerms('');
    if (onTyping) onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/50">
      {/* Proposal form */}
      {showProposalForm && (
        <div className="p-3 border-b border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white uppercase tracking-wide">
                New Proposal
              </span>
            </div>
            <button
              onClick={() => setShowProposalForm(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 block">
                Amount ($)
              </label>
              <input
                type="number"
                value={proposalAmount}
                onChange={(e) => setProposalAmount(e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 block">
                Tier
              </label>
              <select
                value={sponsorshipType}
                onChange={(e) => setSponsorshipType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">Select…</option>
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 block">
              Terms & Benefits
            </label>
            <input
              type="text"
              value={proposalTerms}
              onChange={(e) => setProposalTerms(e.target.value)}
              placeholder="Logo placement, booth space, speaking slot…"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="p-3 flex items-end gap-2">
        <button
          onClick={() => {}}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex-shrink-0"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowProposalForm(!showProposalForm)}
          className={`p-2 rounded-lg transition-all flex-shrink-0 ${
            showProposalForm
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Send proposal"
        >
          <DollarSign className="w-5 h-5" />
        </button>

        <div className={`flex-1 bg-slate-950 border border-slate-800 rounded-xl ${borderFocus} transition-all`}>
          <textarea
            ref={inputRef}
            rows={1}
            value={content}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={showProposalForm ? 'Add a note to your proposal…' : 'Type a message…'}
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || (!content.trim() && !showProposalForm)}
          className={`p-2.5 rounded-xl text-white ${btnBg} transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
