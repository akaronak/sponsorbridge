import React from 'react';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { PaymentDTO } from '../../types/payment';
import { formatCurrency, formatDate, isRefundable } from '../../types/payment';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentCardProps {
  payment: PaymentDTO;
  role: 'COMPANY' | 'ORGANIZER' | 'ADMIN';
  onViewDetails?: (payment: PaymentDTO) => void;
  onRequestRefund?: (payment: PaymentDTO) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  role,
  onViewDetails,
  onRequestRefund,
}) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {payment.description || `Payment #${payment.id.slice(-8)}`}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDate(payment.createdAt)}
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-white">
          {formatCurrency(payment.amount, payment.currency)}
        </p>
        {role === 'ORGANIZER' && payment.organizerPayout > 0 && (
          <p className="text-xs text-emerald-400 mt-1">
            Your payout: {formatCurrency(payment.organizerPayout, payment.currency)}
          </p>
        )}
        {role === 'ADMIN' && payment.platformCommission > 0 && (
          <p className="text-xs text-amber-400 mt-1">
            Commission: {formatCurrency(payment.platformCommission, payment.currency)}
          </p>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {payment.paymentMethod && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{payment.paymentMethod}</span>
          </div>
        )}
        {payment.escrowHoldDays && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>{payment.escrowHoldDays}d escrow</span>
          </div>
        )}
        {payment.capturedAt && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Captured {formatDate(payment.capturedAt)}</span>
          </div>
        )}
        {payment.refundedAmount > 0 && (
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Refunded: {formatCurrency(payment.refundedAmount)}</span>
          </div>
        )}
      </div>

      {/* Escrow progress bar */}
      {payment.status === 'IN_ESCROW' && payment.escrowStartedAt && payment.releaseEligibleAt && (
        <EscrowProgress
          startedAt={payment.escrowStartedAt}
          releaseAt={payment.releaseEligibleAt}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(payment)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Details
          </button>
        )}
        {onRequestRefund && isRefundable(payment.status) && role === 'COMPANY' && (
          <button
            onClick={() => onRequestRefund(payment)}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
          >
            Request Refund
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Escrow progress sub-component ──────────────────────────

const EscrowProgress: React.FC<{ startedAt: string; releaseAt: string }> = ({
  startedAt,
  releaseAt,
}) => {
  const start = new Date(startedAt).getTime();
  const end = new Date(releaseAt).getTime();
  const now = Date.now();
  const total = end - start;
  const elapsed = now - start;
  const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Escrow Hold
        </span>
        <span>{daysLeft > 0 ? `${daysLeft}d remaining` : 'Ready for release'}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PaymentCard;
