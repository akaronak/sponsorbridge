import React, { useState } from 'react';
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout';
import type { PaymentDTO } from '../../types/payment';
import { formatCurrency } from '../../types/payment';
import { useAuth } from '../../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

interface CheckoutModalProps {
  /** The sponsorship request ID */
  requestId: string;
  /** Amount to pay */
  amount: number;
  /** Description shown in Razorpay widget */
  description?: string;
  /** Currency (default INR) */
  currency?: string;
  /** Called on successful payment */
  onSuccess: (payment: PaymentDTO) => void;
  /** Called on close (cancel or error) */
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  requestId,
  amount,
  description,
  currency = 'INR',
  onSuccess,
  onClose,
}) => {
  const { user } = useAuth();
  const { isLoading, error, initiateCheckout } = useRazorpayCheckout();
  const [confirmed, setConfirmed] = useState(false);

  const handlePay = async () => {
    const result = await initiateCheckout(
      {
        requestId,
        amount,
        currency,
        description,
        idempotencyKey: uuidv4(),
      },
      {
        name: user?.name,
        email: user?.email,
      }
    );

    if (result) {
      onSuccess(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Confirm Payment</h2>
              <p className="text-xs text-slate-400">Secure payment via Razorpay</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Amount display */}
          <div className="text-center py-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(amount, currency)}</p>
            {description && (
              <p className="text-xs text-slate-500 mt-2">{description}</p>
            )}
          </div>

          {/* Platform info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Platform</span>
              <span className="text-white">Eventra</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Payment Method</span>
              <span className="text-white">Razorpay (UPI / Card / NetBanking)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Escrow Protection</span>
              <span className="text-emerald-400">✓ Enabled</span>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              I agree to the platform terms and understand that funds will be held in escrow
              until the event is delivered successfully.
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={!confirmed || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay {formatCurrency(amount, currency)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
