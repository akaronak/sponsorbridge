import React, { useState } from 'react';
import { RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import type { PaymentDTO } from '../../types/payment';
import { formatCurrency } from '../../types/payment';
import { paymentApi } from '../../api/payments';

interface RefundModalProps {
  payment: PaymentDTO;
  onSuccess: (updated: PaymentDTO) => void;
  onClose: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ payment, onSuccess, onClose }) => {
  const maxRefundable = payment.amount - payment.refundedAmount;

  const [amount, setAmount] = useState(maxRefundable);
  const [reason, setReason] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    if (amount <= 0 || amount > maxRefundable) {
      setError(`Amount must be between ₹1 and ${formatCurrency(maxRefundable)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await paymentApi.initiateRefund({
        paymentId: payment.id,
        amount,
        reason: reason.trim(),
        partial: isPartial,
      });
      onSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refund failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-rose-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Request Refund</h2>
              <p className="text-xs text-slate-400">
                Payment #{payment.id.slice(-8)} · {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Refund type toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsPartial(false); setAmount(maxRefundable); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                !isPartial
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Full Refund
            </button>
            <button
              type="button"
              onClick={() => setIsPartial(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                isPartial
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Partial Refund
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Refund Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={!isPartial}
                min={1}
                max={maxRefundable}
                step={0.01}
                className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Max refundable: {formatCurrency(maxRefundable)}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Reason for Refund
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're requesting a refund…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Submit Refund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundModal;
