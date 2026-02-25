// ============================================================
// Payment Type Definitions — mirrors backend DTOs
// ============================================================

// ─── Payment Status FSM ─────────────────────────────────────

export type PaymentStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'IN_ESCROW'
  | 'RELEASED'
  | 'SETTLED'
  | 'DISPUTE_OPEN'
  | 'DISPUTE_WON'
  | 'DISPUTE_LOST'
  | 'REFUND_REQUESTED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_COMPANY_FAVOR'
  | 'RESOLVED_ORGANIZER_FAVOR'
  | 'AUTO_RESOLVED'
  | 'CANCELLED';

// ─── Request DTOs ───────────────────────────────────────────

export interface CreatePaymentOrderRequest {
  requestId: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  description?: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  partial?: boolean;
}

export interface DisputeRequest {
  paymentId: string;
  reason: string;
  category?: string;
  disputedAmount?: number;
  evidence?: DisputeEvidenceEntry[];
}

export interface DisputeEvidenceEntry {
  description: string;
  attachmentUrl?: string;
}

// ─── Response DTOs ──────────────────────────────────────────

export interface PaymentOrderResponse {
  paymentId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentDTO {
  id: string;
  requestId: string;
  companyId: string;
  organizerId: string;
  amount: number;
  platformCommission: number;
  organizerPayout: number;
  refundedAmount: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId: string;
  description?: string;
  paymentMethod?: string;

  // Escrow info
  escrowStartedAt?: string;
  releaseEligibleAt?: string;
  escrowHoldDays?: number;

  // Timestamps
  capturedAt?: string;
  releasedAt?: string;
  settledAt?: string;
  createdAt: string;
}

export interface DisputeDTO {
  id: string;
  paymentId: string;
  requestId: string;
  raisedBy: string;
  raisedByRole: string;
  companyId: string;
  organizerId: string;
  status: DisputeStatus;
  reason: string;
  category?: string;
  disputedAmount: number;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  autoResolveAt?: string;
  evidence: DisputeEvidenceDTO[];
  createdAt: string;
}

export interface DisputeEvidenceDTO {
  submittedBy: string;
  submittedByRole: string;
  description: string;
  attachmentUrl?: string;
  submittedAt: string;
}

export interface RevenueStatsDTO {
  gmv: number;
  platformRevenue: number;
  escrowBalance: number;
  totalRefunded: number;
  totalPayouts: number;
  completedPayments: number;
  activeDisputes: number;
  refundRate: number;
  failureRate: number;
}

export interface TransactionDTO {
  id: string;
  paymentId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

// ─── Spring Data Page response ──────────────────────────────

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ─── UI helpers ─────────────────────────────────────────────

export interface PaymentStatusInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, PaymentStatusInfo> = {
  CREATED:             { label: 'Created',             color: 'text-slate-400',   bgColor: 'bg-slate-500/10',   borderColor: 'border-slate-500/20',   icon: 'clock',          description: 'Payment order created' },
  AUTHORIZED:          { label: 'Authorized',          color: 'text-blue-400',    bgColor: 'bg-blue-500/10',    borderColor: 'border-blue-500/20',    icon: 'check',          description: 'Payment authorized by gateway' },
  CAPTURED:            { label: 'Captured',            color: 'text-cyan-400',    bgColor: 'bg-cyan-500/10',    borderColor: 'border-cyan-500/20',    icon: 'download',       description: 'Funds captured successfully' },
  IN_ESCROW:           { label: 'In Escrow',           color: 'text-amber-400',   bgColor: 'bg-amber-500/10',   borderColor: 'border-amber-500/20',   icon: 'lock',           description: 'Funds held in escrow' },
  RELEASED:            { label: 'Released',            color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: 'unlock',         description: 'Funds released from escrow' },
  SETTLED:             { label: 'Settled',             color: 'text-green-400',   bgColor: 'bg-green-500/10',   borderColor: 'border-green-500/20',   icon: 'check-circle',   description: 'Payment fully settled' },
  DISPUTE_OPEN:        { label: 'Disputed',            color: 'text-orange-400',  bgColor: 'bg-orange-500/10',  borderColor: 'border-orange-500/20',  icon: 'alert-triangle', description: 'Dispute raised on this payment' },
  DISPUTE_WON:         { label: 'Dispute Won',         color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: 'shield-check',   description: 'Dispute resolved in organizer\'s favor' },
  DISPUTE_LOST:        { label: 'Dispute Lost',        color: 'text-red-400',     bgColor: 'bg-red-500/10',     borderColor: 'border-red-500/20',     icon: 'shield-x',       description: 'Dispute resolved in company\'s favor' },
  REFUND_REQUESTED:    { label: 'Refund Requested',    color: 'text-purple-400',  bgColor: 'bg-purple-500/10',  borderColor: 'border-purple-500/20',  icon: 'rotate-ccw',     description: 'Refund has been requested' },
  PARTIALLY_REFUNDED:  { label: 'Partially Refunded',  color: 'text-violet-400',  bgColor: 'bg-violet-500/10',  borderColor: 'border-violet-500/20',  icon: 'rotate-ccw',     description: 'Partial refund issued' },
  REFUNDED:            { label: 'Refunded',            color: 'text-rose-400',    bgColor: 'bg-rose-500/10',    borderColor: 'border-rose-500/20',    icon: 'rotate-ccw',     description: 'Full refund completed' },
  FAILED:              { label: 'Failed',              color: 'text-red-500',     bgColor: 'bg-red-500/10',     borderColor: 'border-red-500/20',     icon: 'x-circle',       description: 'Payment failed' },
  CANCELLED:           { label: 'Cancelled',           color: 'text-slate-500',   bgColor: 'bg-slate-500/10',   borderColor: 'border-slate-500/20',   icon: 'x',              description: 'Payment cancelled' },
  EXPIRED:             { label: 'Expired',             color: 'text-slate-500',   bgColor: 'bg-slate-500/10',   borderColor: 'border-slate-500/20',   icon: 'clock',          description: 'Payment expired' },
};

export const DISPUTE_STATUS_MAP: Record<DisputeStatus, { label: string; color: string; bgColor: string }> = {
  OPEN:                       { label: 'Open',                       color: 'text-orange-400',  bgColor: 'bg-orange-500/10' },
  UNDER_REVIEW:               { label: 'Under Review',               color: 'text-blue-400',    bgColor: 'bg-blue-500/10' },
  RESOLVED_COMPANY_FAVOR:     { label: 'Resolved (Company)',          color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  RESOLVED_ORGANIZER_FAVOR:   { label: 'Resolved (Organizer)',        color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  AUTO_RESOLVED:              { label: 'Auto-Resolved',              color: 'text-cyan-400',    bgColor: 'bg-cyan-500/10' },
  CANCELLED:                  { label: 'Cancelled',                  color: 'text-slate-400',   bgColor: 'bg-slate-500/10' },
};

/** Format amount as INR currency */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format ISO datetime to readable string */
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Is the status refundable? */
export function isRefundable(status: PaymentStatus): boolean {
  return ['IN_ESCROW', 'RELEASED', 'SETTLED', 'DISPUTE_LOST'].includes(status);
}

/** Is the status terminal? */
export function isTerminal(status: PaymentStatus): boolean {
  return ['REFUNDED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status);
}
