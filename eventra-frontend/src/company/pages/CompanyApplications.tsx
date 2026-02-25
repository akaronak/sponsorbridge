import React, { useState } from 'react';
import {
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  ArrowLeftRight,
  DollarSign,
  Search,
} from 'lucide-react';
import type { Proposal, ProposalStatus } from '../../types';

// ——— Mock proposals ————————————————————————————————————
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'p1', eventId: 'e1', eventTitle: 'HackFest 2026', companyId: 'c1', companyName: 'TechVenture Corp',
    organizerId: 'o1', organizerName: 'John Smith',
    monetaryOffer: 10000, conditions: 'Exclusive tech sponsor category', brandingExpectations: 'Main stage banner + logo on all materials',
    negotiationDeadline: '2026-03-01', status: 'ACCEPTED',
    createdAt: '2026-02-01', updatedAt: '2026-02-10',
  },
  {
    id: 'p2', eventId: 'e2', eventTitle: 'Spring Career Fair 2026', companyId: 'c1', companyName: 'TechVenture Corp',
    organizerId: 'o2', organizerName: 'Sarah Chen',
    monetaryOffer: 15000, goodiesDescription: 'Branded laptop bags for all attendees',
    conditions: 'Priority booth location', brandingExpectations: 'Title sponsor branding',
    negotiationDeadline: '2026-03-10', status: 'VIEWED',
    createdAt: '2026-02-05', updatedAt: '2026-02-12',
  },
  {
    id: 'p3', eventId: 'e3', eventTitle: 'Music & Arts Festival', companyId: 'c1', companyName: 'TechVenture Corp',
    organizerId: 'o3', organizerName: 'Mike Johnson',
    monetaryOffer: 5000, goodiesDescription: 'Merchandise + product samples',
    negotiationDeadline: '2026-03-20', status: 'COUNTERED',
    counterOffer: { amount: 7500, message: 'We value your partnership but our minimum for title sponsors is $7,500. Includes prime stage placement and exclusive brand zone.', createdAt: '2026-02-15' },
    createdAt: '2026-02-08', updatedAt: '2026-02-15',
  },
  {
    id: 'p4', eventId: 'e4', eventTitle: 'AI Summit 2026', companyId: 'c1', companyName: 'TechVenture Corp',
    organizerId: 'o4', organizerName: 'Emily Zhang',
    monetaryOffer: 20000, conditions: 'Speaking slot for CTO', brandingExpectations: 'Innovation Sponsor title',
    negotiationDeadline: '2026-04-01', status: 'SENT',
    createdAt: '2026-02-18', updatedAt: '2026-02-18',
  },
  {
    id: 'p5', eventId: 'e5', eventTitle: 'College Sports Championship', companyId: 'c1', companyName: 'TechVenture Corp',
    organizerId: 'o5', organizerName: 'David Wilson',
    monetaryOffer: 8000, negotiationDeadline: '2026-04-15', status: 'REJECTED',
    createdAt: '2026-02-12', updatedAt: '2026-02-20',
  },
  {
    id: 'p6', eventId: 'e6', eventTitle: 'HealthTech Expo', companyId: 'c1', companyName: 'TechVenture Corp',
    organizerId: 'o6', organizerName: 'Dr. Lisa Park',
    monetaryOffer: 12000, conditions: 'Booth near main entrance', negotiationDeadline: '2026-04-20', status: 'DRAFT',
    createdAt: '2026-02-20', updatedAt: '2026-02-20',
  },
];

const STATUS_CONFIG: Record<ProposalStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', icon: <FileText className="w-3.5 h-3.5" />, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  SENT: { label: 'Sent', icon: <Send className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  VIEWED: { label: 'Viewed', icon: <Eye className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  COUNTERED: { label: 'Countered', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ACCEPTED: { label: 'Accepted', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  REJECTED: { label: 'Rejected', icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
  EXPIRED: { label: 'Expired', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

const CompanyApplications: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_PROPOSALS.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.eventTitle.toLowerCase().includes(q) || p.organizerName.toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts = MOCK_PROPOSALS.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        <p className="text-slate-400 mt-1">Track your sponsorship proposals and negotiations</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {(Object.keys(STATUS_CONFIG) as ProposalStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'ALL' : status)}
              className={`p-3 rounded-xl border transition-all text-center ${
                statusFilter === status
                  ? `${cfg.bg} border-current ${cfg.color}`
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`flex items-center justify-center gap-1.5 mb-1 ${statusFilter === status ? cfg.color : 'text-slate-400'}`}>
                {cfg.icon}
                <span className="text-xs font-medium">{cfg.label}</span>
              </div>
              <p className={`text-lg font-bold ${statusFilter === status ? cfg.color : 'text-white'}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search proposals..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* Proposals list */}
      <div className="space-y-3">
        {filtered.map((proposal) => {
          const cfg = STATUS_CONFIG[proposal.status];
          const isExpanded = expandedId === proposal.id;

          return (
            <div
              key={proposal.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                {/* Status icon */}
                <div className={`p-2.5 rounded-xl ${cfg.bg}`}>
                  <div className={cfg.color}>{cfg.icon}</div>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{proposal.eventTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">by {proposal.organizerName}</p>
                </div>

                {/* Offer */}
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    {proposal.monetaryOffer.toLocaleString()}
                  </div>
                  {proposal.counterOffer && (
                    <p className="text-xs text-amber-400 mt-0.5">
                      Counter: ${proposal.counterOffer.amount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} flex items-center gap-1`}>
                  {cfg.icon}
                  {cfg.label}
                </span>

                {/* Deadline */}
                <div className="hidden lg:block text-right">
                  <p className="text-xs text-slate-500">Deadline</p>
                  <p className="text-xs text-slate-400">{new Date(proposal.negotiationDeadline).toLocaleDateString()}</p>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {/* Left: Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Your Offer</p>
                        <p className="text-sm text-white font-medium">${proposal.monetaryOffer.toLocaleString()}</p>
                      </div>
                      {proposal.goodiesDescription && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Goodies</p>
                          <p className="text-sm text-slate-300">{proposal.goodiesDescription}</p>
                        </div>
                      )}
                      {proposal.conditions && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Conditions</p>
                          <p className="text-sm text-slate-300">{proposal.conditions}</p>
                        </div>
                      )}
                      {proposal.brandingExpectations && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Branding</p>
                          <p className="text-sm text-slate-300">{proposal.brandingExpectations}</p>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Sent</p>
                          <p className="text-xs text-slate-400">{new Date(proposal.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Last Update</p>
                          <p className="text-xs text-slate-400">{new Date(proposal.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Counter-offer / Actions */}
                    <div>
                      {proposal.counterOffer && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-amber-400">Counter-Offer</span>
                          </div>
                          <p className="text-lg font-bold text-white mb-2">${proposal.counterOffer.amount.toLocaleString()}</p>
                          <p className="text-sm text-slate-400">{proposal.counterOffer.message}</p>
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all">
                              Accept
                            </button>
                            <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-all">
                              Counter
                            </button>
                            <button className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg transition-all">
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {proposal.status === 'DRAFT' && (
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all">
                          <Send className="w-4 h-4" />
                          Send Proposal
                        </button>
                      )}

                      {['SENT', 'VIEWED', 'COUNTERED'].includes(proposal.status) && (
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all mt-2">
                          <MessageSquare className="w-4 h-4" />
                          Open Negotiation Thread
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-lg">No proposals found</p>
          <p className="text-slate-500 text-sm mt-1">Start by discovering events and sending proposals</p>
        </div>
      )}
    </div>
  );
};

export default CompanyApplications;
