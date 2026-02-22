import React, { useState } from 'react';
import {
  Award,
  Calendar,

  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Search,
} from 'lucide-react';
import type { Deal, DealStatus } from '../../types';

// ——— Mock deals ————————————————————————————————————————
const MOCK_DEALS: Deal[] = [
  {
    id: 'd1',
    proposalId: 'p1',
    eventId: 'e1',
    eventTitle: 'HackFest 2026',
    companyId: 'c1',
    companyName: 'TechVenture Corp',
    organizerId: 'o1',
    organizerName: 'John Smith',
    agreedAmount: 10000,
    sponsorshipType: 'MONETARY',
    status: 'ACTIVE',
    startDate: '2026-03-01',
    endDate: '2026-06-01',
    deliverables: [
      { id: 'del1', label: 'Logo on main stage banner', completed: true },
      { id: 'del2', label: 'Social media shoutout (3 posts)', completed: true },
      { id: 'del3', label: 'Logo on event website', completed: true },
      { id: 'del4', label: 'Branded swag distribution', completed: false },
      { id: 'del5', label: 'Post-event analytics report', completed: false },
    ],
    createdAt: '2026-02-10',
  },
  {
    id: 'd2',
    proposalId: 'p10',
    eventId: 'e10',
    eventTitle: 'Innovation Week 2026',
    companyId: 'c1',
    companyName: 'TechVenture Corp',
    organizerId: 'o7',
    organizerName: 'Alex Rivera',
    agreedAmount: 25000,
    sponsorshipType: 'HYBRID',
    status: 'ACTIVE',
    startDate: '2026-04-01',
    endDate: '2026-07-15',
    deliverables: [
      { id: 'del6', label: 'Keynote sponsor branding', completed: true },
      { id: 'del7', label: 'Booth space (premium location)', completed: false },
      { id: 'del8', label: 'Attendee bag inserts (5,000 units)', completed: false },
      { id: 'del9', label: 'Lead scanner access + data', completed: false },
      { id: 'del10', label: 'Speaking slot (30 min)', completed: false },
    ],
    createdAt: '2026-03-01',
  },
  {
    id: 'd3',
    proposalId: 'p11',
    eventId: 'e11',
    eventTitle: 'Code Summit 2025',
    companyId: 'c1',
    companyName: 'TechVenture Corp',
    organizerId: 'o8',
    organizerName: 'Rachel Green',
    agreedAmount: 7500,
    sponsorshipType: 'MONETARY',
    status: 'COMPLETED',
    startDate: '2025-10-01',
    endDate: '2025-12-15',
    deliverables: [
      { id: 'del11', label: 'Gold sponsor tier branding', completed: true },
      { id: 'del12', label: 'Panel participation', completed: true },
      { id: 'del13', label: 'Post-event report', completed: true },
    ],
    createdAt: '2025-09-15',
  },
  {
    id: 'd4',
    proposalId: 'p12',
    eventId: 'e12',
    eventTitle: 'GreenTech Conference',
    companyId: 'c1',
    companyName: 'TechVenture Corp',
    organizerId: 'o9',
    organizerName: 'Bryan Adams',
    agreedAmount: 5000,
    sponsorshipType: 'GOODIES',
    status: 'CANCELLED',
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    deliverables: [
      { id: 'del14', label: 'Branded merchandise delivery', completed: false },
      { id: 'del15', label: 'Product demo area', completed: false },
    ],
    createdAt: '2026-01-20',
  },
];

const DEAL_STATUS_CONFIG: Record<DealStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  COMPLETED: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const CompanyDeals: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_DEALS.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.eventTitle.toLowerCase().includes(q) || d.organizerName.toLowerCase().includes(q);
    }
    return true;
  });

  const totalInvested = MOCK_DEALS.filter((d) => d.status !== 'CANCELLED').reduce((s, d) => s + d.agreedAmount, 0);
  const activeCount = MOCK_DEALS.filter((d) => d.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Deals</h1>
          <p className="text-slate-400 mt-1">Manage your sponsorship agreements and deliverables</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-slate-500">Total Invested</p>
            <p className="text-lg font-bold text-emerald-400">${totalInvested.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Active</p>
            <p className="text-lg font-bold text-white">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            All ({MOCK_DEALS.length})
          </button>
          {(Object.keys(DEAL_STATUS_CONFIG) as DealStatus[]).map((status) => {
            const cfg = DEAL_STATUS_CONFIG[status];
            const count = MOCK_DEALS.filter((d) => d.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'ALL' : status)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === status ? `${cfg.bg} ${cfg.color}` : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cfg.icon}
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Deals list */}
      <div className="space-y-4">
        {filtered.map((deal) => {
          const cfg = DEAL_STATUS_CONFIG[deal.status];
          const deliveredCount = deal.deliverables.filter((d) => d.completed).length;
          const deliverableProgress = Math.round((deliveredCount / deal.deliverables.length) * 100);

          return (
            <div key={deal.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white">{deal.eventTitle}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">with {deal.organizerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">${deal.agreedAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 capitalize">{deal.sponsorshipType.toLowerCase()}</p>
                </div>
              </div>

              {/* Meta bar */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(deal.startDate).toLocaleDateString()} — {new Date(deal.endDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" />{deal.sponsorshipType}</span>
              </div>

              {/* Deliverables progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Deliverables</span>
                  <span className="text-white font-medium">{deliveredCount}/{deal.deliverables.length} completed</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${deal.status === 'CANCELLED' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${deliverableProgress}%` }}
                  />
                </div>
              </div>

              {/* Deliverable checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {deal.deliverables.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                    )}
                    <span className={item.completed ? 'text-slate-400 line-through' : 'text-slate-300'}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message Organizer
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Event
                </button>
                {deal.status === 'ACTIVE' && (
                  <button className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium rounded-lg transition-all">
                    <Award className="w-3.5 h-3.5" />
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Award className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-lg">No deals found</p>
          <p className="text-slate-500 text-sm mt-1">Get started by sending proposals to events</p>
        </div>
      )}
    </div>
  );
};

export default CompanyDeals;
