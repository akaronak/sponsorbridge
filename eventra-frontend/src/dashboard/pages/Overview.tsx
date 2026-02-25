import React from 'react';
import {
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// �"��"��"� Mock data (will be replaced with API calls) �"��"��"��"��"��"��"��"��"��"��"��"�
const stats = [
  {
    label: 'Total Events',
    value: '12',
    change: '+3',
    trend: 'up' as const,
    icon: <Calendar className="w-5 h-5" />,
    color: 'indigo',
  },
  {
    label: 'Active Sponsors',
    value: '28',
    change: '+5',
    trend: 'up' as const,
    icon: <Building2 className="w-5 h-5" />,
    color: 'emerald',
  },
  {
    label: 'Revenue',
    value: '$48.5K',
    change: '+12%',
    trend: 'up' as const,
    icon: <DollarSign className="w-5 h-5" />,
    color: 'amber',
  },
  {
    label: 'Match Rate',
    value: '94%',
    change: '+2%',
    trend: 'up' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'blue',
  },
];

const recentActivity = [
  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'TechCorp accepted sponsorship for HackFest 2026', time: '2h ago' },
  { icon: <MessageSquare className="w-4 h-4 text-blue-400" />, text: 'New message from InnovateCo regarding Spring Gala', time: '4h ago' },
  { icon: <AlertCircle className="w-4 h-4 text-amber-400" />, text: 'AI Match: 3 new sponsor recommendations available', time: '6h ago' },
  { icon: <Clock className="w-4 h-4 text-slate-400" />, text: 'Career Fair 2026 deadline approaching �" 5 days left', time: '8h ago' },
  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'BrandLabs confirmed $5,000 sponsorship for Music Fest', time: '1d ago' },
];

const upcomingEvents = [
  { name: 'HackFest 2026', date: 'Mar 15, 2026', sponsors: 4, raised: '$12,000', goal: '$15,000', progress: 80 },
  { name: 'Spring Career Fair', date: 'Apr 2, 2026', sponsors: 8, raised: '$24,500', goal: '$30,000', progress: 82 },
  { name: 'Music & Arts Festival', date: 'Apr 20, 2026', sponsors: 2, raised: '$5,000', goal: '$20,000', progress: 25 },
];

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  blue: 'bg-blue-500/10 text-blue-400',
};

const Overview: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening with your sponsorships today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
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
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-all">
              <Calendar className="w-4 h-4" />
              Create New Event
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-800 transition-all">
              <Building2 className="w-4 h-4" />
              Find Sponsors
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-800 transition-all">
              <MessageSquare className="w-4 h-4" />
              Send Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View all �'
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sponsors</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Raised</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {upcomingEvents.map((event) => (
                <tr key={event.name} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                      {event.name}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">{event.date}</td>
                  <td className="py-3 pr-4 text-sm text-slate-400">{event.sponsors}</td>
                  <td className="py-3 pr-4 text-sm text-white font-medium">{event.raised}</td>
                  <td className="py-3 w-40">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{event.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
