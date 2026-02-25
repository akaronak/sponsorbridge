import React from 'react';
import {
  FileText,
  Award,
  Calendar,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Target,
  Search,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ——— Mock data (will be replaced with API calls) ————
const stats = [
  {
    label: 'Total Requests Sent',
    value: '34',
    change: '+8',
    trend: 'up' as const,
    icon: <FileText className="w-5 h-5" />,
    color: 'emerald',
  },
  {
    label: 'Active Partnerships',
    value: '12',
    change: '+3',
    trend: 'up' as const,
    icon: <Award className="w-5 h-5" />,
    color: 'teal',
  },
  {
    label: 'Upcoming Sponsored',
    value: '5',
    change: '+2',
    trend: 'up' as const,
    icon: <Calendar className="w-5 h-5" />,
    color: 'blue',
  },
  {
    label: 'Response Rate',
    value: '78%',
    change: '+5%',
    trend: 'up' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'amber',
  },
  {
    label: 'Avg Deal Value',
    value: '$8.2K',
    change: '+12%',
    trend: 'up' as const,
    icon: <DollarSign className="w-5 h-5" />,
    color: 'purple',
  },
];

const recentActivity = [
  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'HackFest 2026 accepted your $10,000 sponsorship proposal', time: '1h ago', type: 'success' },
  { icon: <Eye className="w-4 h-4 text-blue-400" />, text: 'Spring Career Fair organizer viewed your proposal', time: '3h ago', type: 'info' },
  { icon: <Send className="w-4 h-4 text-teal-400" />, text: 'Counter-offer received for Music & Arts Festival sponsorship', time: '5h ago', type: 'action' },
  { icon: <AlertCircle className="w-4 h-4 text-amber-400" />, text: 'Application deadline for AI Summit 2026 in 3 days', time: '8h ago', type: 'warning' },
  { icon: <Clock className="w-4 h-4 text-slate-400" />, text: 'Negotiation thread with TechWeek updated', time: '1d ago', type: 'neutral' },
];

const activeDeals = [
  { event: 'HackFest 2026', organizer: 'John Smith', amount: '$10,000', type: 'Monetary', status: 'Active', date: 'Mar 15, 2026' },
  { event: 'Spring Career Fair', organizer: 'Sarah Chen', amount: '$5,000 + Goodies', type: 'Hybrid', status: 'Active', date: 'Apr 2, 2026' },
  { event: 'Music & Arts Festival', organizer: 'Mike Johnson', amount: '$3,500', type: 'Monetary', status: 'Negotiating', date: 'Apr 20, 2026' },
];

const proposalPipeline = [
  { label: 'Sent', count: 8, color: 'bg-slate-500' },
  { label: 'Viewed', count: 5, color: 'bg-blue-500' },
  { label: 'Countered', count: 3, color: 'bg-amber-500' },
  { label: 'Accepted', count: 12, color: 'bg-emerald-500' },
  { label: 'Rejected', count: 6, color: 'bg-red-500' },
];

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  teal: 'bg-teal-500/10 text-teal-400',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  purple: 'bg-purple-500/10 text-purple-400',
};

const CompanyOverview: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-400 mt-1">Here's your sponsorship portfolio overview.</p>
      </div>

      {/* Stats grid — 5 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorMap[stat.color]}`}>
                {stat.icon}
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Proposal Pipeline */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Proposal Pipeline</h2>
        <div className="flex items-center gap-2 mb-3">
          {proposalPipeline.map((stage) => {
            const total = proposalPipeline.reduce((s, p) => s + p.count, 0);
            const pct = Math.round((stage.count / total) * 100);
            return (
              <div
                key={stage.label}
                className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${stage.label}: ${stage.count}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          {proposalPipeline.map((stage) => (
            <div key={stage.label} className="text-center">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <span className="text-xs text-slate-400">{stage.label}</span>
              </div>
              <p className="text-sm font-bold text-white">{stage.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 group">
                <div className="mt-0.5">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    {activity.text}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all">
              <Search className="w-4 h-4" />
              Discover Events
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-800 transition-all">
              <Send className="w-4 h-4" />
              Send Proposal
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-800 transition-all">
              <Target className="w-4 h-4" />
              Set Sponsorship Goals
            </button>
          </div>

          {/* Investment summary */}
          <div className="mt-5 p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Total Invested (2026)</p>
            <p className="text-xl font-bold text-white">$98,500</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">+24% vs last year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deals Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Deals</h2>
          <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Organizer</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeDeals.map((deal) => (
                <tr key={deal.event} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {deal.event}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">{deal.organizer}</td>
                  <td className="py-3 pr-4 text-sm text-white font-medium">{deal.amount}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      deal.type === 'Monetary' ? 'bg-emerald-500/10 text-emerald-400' :
                      deal.type === 'Hybrid' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {deal.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      deal.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-slate-400">{deal.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;
