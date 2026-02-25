import React from 'react';
import {
  DollarSign,
  Lock,
  Calendar,
  RotateCcw,
  FileText,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import type { PaymentDTO } from '../../types/payment';
import { formatCurrency, formatDate, isRefundable } from '../../types/payment';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentDetailPanelProps {
  payment: PaymentDTO;
  role: 'COMPANY' | 'ORGANIZER' | 'ADMIN';
  onClose: () => void;
  onRequestRefund?: (payment: PaymentDTO) => void;
  onRaiseDispute?: (payment: PaymentDTO) => void;
}

const PaymentDetailPanel: React.FC<PaymentDetailPanelProps> = ({
  payment,
  role,
  onClose,
  onRequestRefund,
  onRaiseDispute,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(payment.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg h-full bg-slate-950 border-l border-slate-800 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-white">Payment Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-mono">{payment.id}</span>
              <button onClick={copyId} className="text-slate-500 hover:text-slate-300 transition-colors">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Status & amount hero */}
          <div className="text-center py-4">
            <PaymentStatusBadge status={payment.status} size="lg" />
            <p className="text-3xl font-bold text-white mt-4">
              {formatCurrency(payment.amount, payment.currency)}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {payment.description || 'Sponsorship Payment'}
            </p>
          </div>

          {/* Financial breakdown */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              Financial Breakdown
            </h3>
            <div className="space-y-2">
              <Row label="Gross Amount" value={formatCurrency(payment.amount)} />
              <Row label="Platform Commission" value={`-${formatCurrency(payment.platformCommission)}`} valueClass="text-amber-400" />
              <div className="border-t border-slate-700 pt-2">
                <Row label="Organizer Payout" value={formatCurrency(payment.organizerPayout)} valueClass="text-emerald-400 font-semibold" />
              </div>
              {payment.refundedAmount > 0 && (
                <Row label="Refunded" value={`-${formatCurrency(payment.refundedAmount)}`} valueClass="text-rose-400" />
              )}
            </div>
          </div>

          {/* Escrow details */}
          {(payment.escrowStartedAt || payment.releaseEligibleAt) && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Escrow Information
              </h3>
              <div className="space-y-2">
                <Row label="Escrow Start" value={formatDate(payment.escrowStartedAt)} />
                <Row label="Release Eligible" value={formatDate(payment.releaseEligibleAt)} />
                <Row label="Hold Period" value={`${payment.escrowHoldDays || 7} days`} />
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Timeline
            </h3>
            <div className="space-y-2">
              <Row label="Created" value={formatDate(payment.createdAt)} />
              {payment.capturedAt && <Row label="Captured" value={formatDate(payment.capturedAt)} />}
              {payment.releasedAt && <Row label="Released" value={formatDate(payment.releasedAt)} />}
              {payment.settledAt && <Row label="Settled" value={formatDate(payment.settledAt)} />}
            </div>
          </div>

          {/* Reference IDs */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              References
            </h3>
            <div className="space-y-2">
              <Row label="Request ID" value={payment.requestId} mono />
              <Row label="Razorpay Order" value={payment.razorpayOrderId || '—'} mono />
              {payment.paymentMethod && <Row label="Method" value={payment.paymentMethod} />}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {onRequestRefund && isRefundable(payment.status) && role !== 'ORGANIZER' && (
              <button
                onClick={() => onRequestRefund(payment)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Request Refund
              </button>
            )}
            {onRaiseDispute && ['IN_ESCROW', 'RELEASED'].includes(payment.status) && (
              <button
                onClick={() => onRaiseDispute(payment)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Raise Dispute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helper row component ───────────────────────────────────

interface RowProps {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}

const Row: React.FC<RowProps> = ({ label, value, valueClass = 'text-white', mono = false }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-500">{label}</span>
    <span className={`${valueClass} ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
  </div>
);

export default PaymentDetailPanel;
