import client from './client';
import type {
  CreatePaymentOrderRequest,
  PaymentVerificationRequest,
  RefundRequest,
  DisputeRequest,
  PaymentOrderResponse,
  PaymentDTO,
  DisputeDTO,
  RevenueStatsDTO,
  TransactionDTO,
  SpringPage,
} from '../types/payment';

// ═══════════════════════════════════════════════════════════
//  Payment API — maps to PaymentController endpoints
// ═══════════════════════════════════════════════════════════

export const paymentApi = {
  /**
   * POST /api/payments/order
   * Create a Razorpay order for a sponsorship payment.
   */
  createOrder: async (request: CreatePaymentOrderRequest): Promise<PaymentOrderResponse> => {
    const { data } = await client.post<PaymentOrderResponse>('/api/payments/order', request);
    return data;
  },

  /**
   * POST /api/payments/verify
   * Verify payment after Razorpay checkout completes.
   */
  verifyPayment: async (request: PaymentVerificationRequest): Promise<PaymentDTO> => {
    const { data } = await client.post<PaymentDTO>('/api/payments/verify', request);
    return data;
  },

  /**
   * POST /api/payments/refund
   * Initiate a full or partial refund.
   */
  initiateRefund: async (request: RefundRequest): Promise<PaymentDTO> => {
    const { data } = await client.post<PaymentDTO>('/api/payments/refund', request);
    return data;
  },

  /**
   * GET /api/payments/:paymentId
   * Get payment details by ID.
   */
  getById: async (paymentId: string): Promise<PaymentDTO> => {
    const { data } = await client.get<PaymentDTO>(`/api/payments/${paymentId}`);
    return data;
  },

  /**
   * GET /api/payments/company/:companyId
   * Get payment history for a company.
   */
  getCompanyPayments: async (companyId: string, page = 0, size = 20): Promise<SpringPage<PaymentDTO>> => {
    const { data } = await client.get<SpringPage<PaymentDTO>>(`/api/payments/company/${companyId}`, {
      params: { page, size },
    });
    return data;
  },

  /**
   * GET /api/payments/organizer/:organizerId
   * Get payment history for an organizer.
   */
  getOrganizerPayments: async (organizerId: string, page = 0, size = 20): Promise<SpringPage<PaymentDTO>> => {
    const { data } = await client.get<SpringPage<PaymentDTO>>(`/api/payments/organizer/${organizerId}`, {
      params: { page, size },
    });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════
//  Admin Payment API — maps to AdminPaymentController
// ═══════════════════════════════════════════════════════════

export const adminPaymentApi = {
  /**
   * GET /api/admin/payments/stats
   * Get platform revenue statistics.
   */
  getRevenueStats: async (from: string, to: string): Promise<RevenueStatsDTO> => {
    const { data } = await client.get<RevenueStatsDTO>('/api/admin/payments/stats', {
      params: { from, to },
    });
    return data;
  },

  /**
   * GET /api/admin/payments/:paymentId/transactions
   * Get transaction audit trail for a payment.
   */
  getTransactions: async (paymentId: string, page = 0, size = 50): Promise<SpringPage<TransactionDTO>> => {
    const { data } = await client.get<SpringPage<TransactionDTO>>(
      `/api/admin/payments/${paymentId}/transactions`,
      { params: { page, size } }
    );
    return data;
  },

  /**
   * POST /api/admin/payments/:paymentId/release
   * Manually release a payment from escrow.
   */
  releaseEscrow: async (paymentId: string): Promise<PaymentDTO> => {
    const { data } = await client.post<PaymentDTO>(`/api/admin/payments/${paymentId}/release`);
    return data;
  },

  /**
   * POST /api/admin/payments/:paymentId/settle
   * Manually settle a released payment.
   */
  settlePayment: async (paymentId: string, batchId?: string): Promise<PaymentDTO> => {
    const { data } = await client.post<PaymentDTO>(
      `/api/admin/payments/${paymentId}/settle`,
      null,
      { params: batchId ? { batchId } : undefined }
    );
    return data;
  },

  // ─── Dispute endpoints ────────────────────────────────

  /**
   * POST /api/admin/payments/disputes
   * Raise a dispute.
   */
  raiseDispute: async (request: DisputeRequest, raisedByRole: string): Promise<DisputeDTO> => {
    const { data } = await client.post<DisputeDTO>(
      '/api/admin/payments/disputes',
      request,
      { params: { raisedByRole } }
    );
    return data;
  },

  /**
   * GET /api/admin/payments/disputes
   * Get disputes by status.
   */
  getDisputes: async (status: string, page = 0, size = 20): Promise<SpringPage<DisputeDTO>> => {
    const { data } = await client.get<SpringPage<DisputeDTO>>('/api/admin/payments/disputes', {
      params: { status, page, size },
    });
    return data;
  },

  /**
   * GET /api/admin/payments/disputes/:disputeId
   */
  getDispute: async (disputeId: string): Promise<DisputeDTO> => {
    const { data } = await client.get<DisputeDTO>(`/api/admin/payments/disputes/${disputeId}`);
    return data;
  },

  /**
   * GET /api/admin/payments/:paymentId/dispute
   */
  getDisputeByPayment: async (paymentId: string): Promise<DisputeDTO> => {
    const { data } = await client.get<DisputeDTO>(`/api/admin/payments/${paymentId}/dispute`);
    return data;
  },

  /**
   * PUT /api/admin/payments/disputes/:disputeId/review
   */
  markUnderReview: async (disputeId: string): Promise<DisputeDTO> => {
    const { data } = await client.put<DisputeDTO>(`/api/admin/payments/disputes/${disputeId}/review`);
    return data;
  },

  /**
   * POST /api/admin/payments/disputes/:disputeId/resolve/company
   */
  resolveForCompany: async (disputeId: string, notes: string): Promise<DisputeDTO> => {
    const { data } = await client.post<DisputeDTO>(
      `/api/admin/payments/disputes/${disputeId}/resolve/company`,
      { notes }
    );
    return data;
  },

  /**
   * POST /api/admin/payments/disputes/:disputeId/resolve/organizer
   */
  resolveForOrganizer: async (disputeId: string, notes: string): Promise<DisputeDTO> => {
    const { data } = await client.post<DisputeDTO>(
      `/api/admin/payments/disputes/${disputeId}/resolve/organizer`,
      { notes }
    );
    return data;
  },

  /**
   * POST /api/admin/payments/disputes/:disputeId/evidence
   */
  addEvidence: async (
    disputeId: string,
    role: string,
    description: string,
    attachmentUrl?: string
  ): Promise<DisputeDTO> => {
    const { data } = await client.post<DisputeDTO>(
      `/api/admin/payments/disputes/${disputeId}/evidence`,
      { role, description, attachmentUrl }
    );
    return data;
  },
};
