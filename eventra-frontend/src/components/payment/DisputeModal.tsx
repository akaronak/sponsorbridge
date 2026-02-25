import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { PaymentDTO, DisputeDTO } from '../../types/payment';
import { formatCurrency } from '../../types/payment';
import { adminPaymentApi } from '../../api/payments';

interface DisputeModalProps {
  payment: PaymentDTO;
  raisedByRole: 'COMPANY' | 'ORGANIZER';
  onSuccess: (dispute: DisputeDTO) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Service Not Delivered',
  'Quality Issues',
  'Misrepresentation',
  'Unauthorized Charge',
  'Billing Error',
  'Other',
];

const DisputeModal: React.FC<DisputeModalProps> = ({
  payment,
  raisedByRole,
  onSuccess,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [disputedAmount, setDisputedAmount] = useState(payment.amount);
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dispute = await adminPaymentApi.raiseDispute(
        {
          paymentId: payment.id,
          reason: reason.trim(),
          category,
          disputedAmount,
          evidence: evidenceDesc.trim()
            ? [{ description: evidenceDesc.trim() }]
            : undefined,
        },
        raisedByRole
      );
      onSuccess(dispute);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to raise dispute';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Raise Dispute</h2>
              <p className="text-xs text-slate-400">
                Payment #{payment.id.slice(-8)} · {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Disputed amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Disputed Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
              <input
                type="number"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(Number(e.target.value))}
                min={1}
                max={payment.amount}
                step={0.01}
                className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue in detail…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Optional evidence */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Supporting Evidence <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={evidenceDesc}
              onChange={(e) => setEvidenceDesc(e.target.value)}
              placeholder="Describe any evidence or attach links…"
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Submit Dispute
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;
