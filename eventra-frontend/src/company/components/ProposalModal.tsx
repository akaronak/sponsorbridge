import React, { useState } from 'react';
import {
  X,
  DollarSign,
  Gift,
  FileText,
  Palette,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import type { DiscoverableEvent, SponsorshipType } from '../../types';

interface ProposalModalProps {
  event: DiscoverableEvent;
  onClose: () => void;
  onSubmit: (proposal: ProposalFormData) => void;
}

export interface ProposalFormData {
  eventId: string;
  monetaryOffer: number;
  sponsorshipType: SponsorshipType;
  goodiesDescription: string;
  conditions: string;
  brandingExpectations: string;
  negotiationDeadline: string;
  message: string;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ event, onClose, onSubmit }) => {
  const [form, setForm] = useState<ProposalFormData>({
    eventId: event.id,
    monetaryOffer: 0,
    sponsorshipType: 'MONETARY',
    goodiesDescription: '',
    conditions: '',
    brandingExpectations: '',
    negotiationDeadline: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.sponsorshipType !== 'GOODIES' && form.monetaryOffer <= 0) {
      errs.monetaryOffer = 'Please enter a monetary offer amount';
    }
    if (form.sponsorshipType !== 'MONETARY' && !form.goodiesDescription.trim()) {
      errs.goodiesDescription = 'Please describe the goodies you are offering';
    }
    if (!form.negotiationDeadline) {
      errs.negotiationDeadline = 'Please set a negotiation deadline';
    }
    if (!form.message.trim()) {
      errs.message = 'Please add a message to the organizer';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Custom Sponsorship Proposal</h2>
            <p className="text-sm text-slate-400">for {event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Sponsorship Type */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Sponsorship Type</label>
            <div className="flex gap-2">
              {(['MONETARY', 'GOODIES', 'HYBRID'] as SponsorshipType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, sponsorshipType: type })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    form.sponsorshipType === type
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {type === 'MONETARY' && <DollarSign className="w-4 h-4" />}
                  {type === 'GOODIES' && <Gift className="w-4 h-4" />}
                  {type === 'HYBRID' && <><DollarSign className="w-4 h-4" /><span>+</span><Gift className="w-4 h-4" /></>}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Monetary Offer */}
          {form.sponsorshipType !== 'GOODIES' && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Monetary Offer
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={form.monetaryOffer || ''}
                  onChange={(e) => setForm({ ...form, monetaryOffer: Number(e.target.value) })}
                  placeholder="Enter amount..."
                  className={`w-full pl-8 pr-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.monetaryOffer ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500/50'
                  }`}
                />
              </div>
              {errors.monetaryOffer && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.monetaryOffer}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Event budget: ${event.budgetRequired.toLocaleString()} | Goal: ${event.sponsorshipGoal.toLocaleString()}
              </p>
            </div>
          )}

          {/* Goodies Description */}
          {form.sponsorshipType !== 'MONETARY' && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                Goodies / In-Kind Offer
              </label>
              <textarea
                value={form.goodiesDescription}
                onChange={(e) => setForm({ ...form, goodiesDescription: e.target.value })}
                placeholder="Describe your in-kind sponsorship (e.g., branded merchandise, product samples, tech equipment...)"
                rows={3}
                className={`w-full px-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none resize-none transition-all ${
                  errors.goodiesDescription ? 'border-red-500/50' : 'border-slate-700 focus:border-emerald-500/50'
                }`}
              />
              {errors.goodiesDescription && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.goodiesDescription}
                </p>
              )}
            </div>
          )}

          {/* Conditions */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Specific Conditions (optional)
            </label>
            <textarea
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              placeholder="Any specific conditions for this sponsorship (exclusivity, placement requirements, etc.)"
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
            />
          </div>

          {/* Branding Expectations */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              Branding Expectations (optional)
            </label>
            <textarea
              value={form.brandingExpectations}
              onChange={(e) => setForm({ ...form, brandingExpectations: e.target.value })}
              placeholder="Logo placement, banner size, stage mentions, social media tags, etc."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
            />
          </div>

          {/* Negotiation Timeline */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Negotiation Deadline
            </label>
            <input
              type="date"
              value={form.negotiationDeadline}
              onChange={(e) => setForm({ ...form, negotiationDeadline: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white focus:outline-none transition-all ${
                errors.negotiationDeadline ? 'border-red-500/50' : 'border-slate-700 focus:border-emerald-500/50'
              }`}
            />
            {errors.negotiationDeadline && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.negotiationDeadline}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Message to Organizer</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Introduce your company and explain why you'd like to sponsor this event..."
              rows={4}
              className={`w-full px-4 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none resize-none transition-all ${
                errors.message ? 'border-red-500/50' : 'border-slate-700 focus:border-emerald-500/50'
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.message}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white text-sm font-medium rounded-xl transition-all"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Sending...' : 'Send Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
