import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';

// �"��"��"� Mock data �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
const kpis = [
  { label: 'Total Revenue', value: '$48,500', change: '+12.5%', trend: 'up' as const, icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Active Events', value: '8', change: '+2', trend: 'up' as const, icon: <Calendar className="w-5 h-5" /> },
  { label: 'Total Sponsors', value: '28', change: '+5', trend: 'up' as const, icon: <Building2 className="w-5 h-5" /> },
  { label: 'Attendees Reached', value: '12.4K', change: '+18%', trend: 'up' as const, icon: <Users className="w-5 h-5" /> },
];

const monthlyRevenue = [
  { month: 'Sep', revenue: 8000 },
  { month: 'Oct', revenue: 12000 },
  { month: 'Nov', revenue: 9500 },
  { month: 'Dec', revenue: 15000 },
  { month: 'Jan', revenue: 18000 },
  { month: 'Feb', revenue: 22000 },
];

const topSponsors = [
  { name: 'TechCorp Inc.', deals: 4, revenue: '$18,000', growth: '+25%' },
  { name: 'FinanceHub', deals: 3, revenue: '$12,500', growth: '+18%' },
  { name: 'InnovateCo', deals: 2, revenue: '$8,000', growth: '+10%' },
  { name: 'GreenEnergy Co', deals: 2, revenue: '$6,000', growth: '+15%' },
  { name: 'BrandLabs', deals: 1, revenue: '$4,000', growth: 'New' },
];

const categoryBreakdown = [
  { category: 'Technology', count: 5, percentage: 40, color: 'bg-indigo-500' },
  { category: 'Academic', count: 3, percentage: 25, color: 'bg-emerald-500' },
  { category: 'Cultural', count: 2, percentage: 15, color: 'bg-amber-500' },
  { category: 'Sports', count: 1, percentage: 10, color: 'bg-blue-500' },
  { category: 'Social', count: 1, percentage: 10, color: 'bg-purple-500' },
];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track performance metrics and sponsorship insights</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">{kpi.icon}</div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Trend</h2>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              +32% vs last period
            </div>
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">${(d.revenue / 1000).toFixed(0)}K</span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Events by Category</h2>
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-300">{cat.category}</span>
                  <span className="text-sm text-slate-500">{cat.count} events</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sponsors Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Top Sponsors</h2>
          <BarChart3 className="w-5 h-5 text-slate-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase">Sponsor</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase">Deals</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {topSponsors.map((sponsor, idx) => (
                <tr key={sponsor.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-white">{sponsor.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-400">{sponsor.deals}</td>
                  <td className="py-3 pr-4 text-sm text-white font-medium">{sponsor.revenue}</td>
                  <td className="py-3">
                    <span className={`text-sm font-medium ${
                      sponsor.growth === 'New' ? 'text-blue-400' : 'text-emerald-400'
                    }`}>
                      {sponsor.growth}
                    </span>
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

export default Analytics;
