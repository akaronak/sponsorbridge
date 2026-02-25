import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  TrendingUp,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { paymentApi } from '../../api/payments';
import type { PaymentDTO, PaymentStatus, SpringPage } from '../../types/payment';
import { formatCurrency, formatDate } from '../../types/payment';
import PaymentStatusBadge from '../../components/payment/PaymentStatusBadge';
import PaymentDetailPanel from '../../components/payment/PaymentDetailPanel';

// ─── Status filter options for organizer ────────────────────

const STATUS_FILTERS: { label: string; value: PaymentStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'In Escrow', value: 'IN_ESCROW' },
  { label: 'Released', value: 'RELEASED' },
  { label: 'Settled', value: 'SETTLED' },
  { label: 'Disputed', value: 'DISPUTE_OPEN' },
  { label: 'Refunded', value: 'REFUNDED' },
];

const Payments: React.FC = () => {
  const { user } = useAuth();

  // ─── State ──────────────────────────────────────────────
  const [page, setPage] = useState<SpringPage<PaymentDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null);

  // ─── Data fetching ──────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await paymentApi.getOrganizerPayments(user.id, currentPage, 10);
      setPage(data);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ─── Derived data ───────────────────────────────────────
  const payments = page?.content || [];
  const filtered = payments.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ─── Stats ──────────────────────────────────────────────
  const totalEarnings = payments
    .filter((p) => ['RELEASED', 'SETTLED'].includes(p.status))
    .reduce((s, p) => s + p.organizerPayout, 0);
  const pendingEscrow = payments
    .filter((p) => p.status === 'IN_ESCROW')
    .reduce((s, p) => s + p.organizerPayout, 0);
  const settled = payments
    .filter((p) => p.status === 'SETTLED')
    .reduce((s, p) => s + p.organizerPayout, 0);
  const disputes = payments.filter((p) => p.status === 'DISPUTE_OPEN').length;

  const stats = [
    { label: 'Total Earnings', value: formatCurrency(totalEarnings), icon: <TrendingUp className="w-5 h-5" />, color: 'emerald' },
    { label: 'Pending (Escrow)', value: formatCurrency(pendingEscrow), icon: <Lock className="w-5 h-5" />, color: 'amber' },
    { label: 'Settled', value: formatCurrency(settled), icon: <CheckCircle2 className="w-5 h-5" />, color: 'green' },
    { label: 'Active Disputes', value: disputes.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: 'orange' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    green: 'bg-green-500/10 text-green-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Payments & Earnings</h1>
        <p className="text-slate-400 mt-1">Track sponsorship income, escrow releases, and payout history.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorMap[stat.color]}`}>{stat.icon}</div>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments…"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === f.value
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Payment</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Total Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Your Payout</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Date</th>
                <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Clock className="w-5 h-5 animate-pulse" />
                      <span className="text-sm">Loading payments…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No payments found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {payment.description || `Payment #${payment.id.slice(-8)}`}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {payment.id.slice(-12)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-300">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(payment.organizerPayout)}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        -{formatCurrency(payment.platformCommission)} fee
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={payment.status} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-400">{formatDate(payment.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(payment);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {page && page.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Page {page.number + 1} of {page.totalPages} · {page.totalElements} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={page.first}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={page.last}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment detail panel */}
      {selectedPayment && (
        <PaymentDetailPanel
          payment={selectedPayment}
          role="ORGANIZER"
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

export default Payments;
