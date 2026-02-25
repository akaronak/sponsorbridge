import React, { useState } from 'react';
import {
  TrendingUp,

  DollarSign,
  BarChart3,
  PieChart,
  Target,

  Eye,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ——— Period selector ———————————————————————————————————
type Period = '7d' | '30d' | '90d' | '12m' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  '12m': '12 Months',
  all: 'All Time',
};

// ——— Mock analytics data ——————————————————————————————
const METRICS = {
  totalInvestment: 98500,
  totalInvestmentChange: 12.5,
  avgROI: 3.2,
  avgROIChange: 0.4,
  brandImpressions: 245000,
  brandImpressionsChange: 18.3,
  dealConversion: 68,
  dealConversionChange: -2.1,
  proposalsSent: 24,
  proposalsSentChange: 8,
  avgResponseTime: 2.3,
  avgResponseTimeChange: -0.5,
};

const MONTHLY_INVESTMENT = [
  { month: 'Sep', amount: 5000 },
  { month: 'Oct', amount: 7500 },
  { month: 'Nov', amount: 12000 },
  { month: 'Dec', amount: 8000 },
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 18500 },
  { month: 'Mar', amount: 22000 },
  { month: 'Apr', amount: 10500 },
];

const CATEGORY_BREAKDOWN = [
  { category: 'Technology', amount: 35000, count: 4, color: 'bg-emerald-500' },
  { category: 'Education', amount: 22000, count: 3, color: 'bg-blue-500' },
  { category: 'Sports', amount: 18000, count: 2, color: 'bg-amber-500' },
  { category: 'Arts & Culture', amount: 15000, count: 3, color: 'bg-purple-500' },
  { category: 'Health', amount: 8500, count: 1, color: 'bg-rose-500' },
];

const FUNNEL_STAGES = [
  { stage: 'Events Viewed', count: 86, pct: 100 },
  { stage: 'Proposals Sent', count: 24, pct: 28 },
  { stage: 'Viewed by Organizer', count: 18, pct: 21 },
  { stage: 'Negotiations', count: 12, pct: 14 },
  { stage: 'Deals Closed', count: 8, pct: 9 },
];

const TOP_PERFORMING = [
  { event: 'HackFest 2026', roi: 4.2, impressions: 45000, leads: 120 },
  { event: 'Innovation Week 2026', roi: 3.8, impressions: 62000, leads: 85 },
  { event: 'Code Summit 2025', roi: 3.5, impressions: 38000, leads: 95 },
  { event: 'Spring Career Fair 2026', roi: 2.9, impressions: 51000, leads: 140 },
];

const CompanyAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('30d');

  const maxInvestment = Math.max(...MONTHLY_INVESTMENT.map((m) => m.amount));
  const totalCategoryAmount = CATEGORY_BREAKDOWN.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Sponsorship performance and ROI insights</p>
        </div>
        <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Investment', value: `$${(METRICS.totalInvestment / 1000).toFixed(1)}k`, change: METRICS.totalInvestmentChange, icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Avg ROI', value: `${METRICS.avgROI}x`, change: METRICS.avgROIChange, icon: <TrendingUp className="w-4 h-4" /> },
          { label: 'Brand Impressions', value: `${(METRICS.brandImpressions / 1000).toFixed(0)}k`, change: METRICS.brandImpressionsChange, icon: <Eye className="w-4 h-4" /> },
          { label: 'Deal Conversion', value: `${METRICS.dealConversion}%`, change: METRICS.dealConversionChange, icon: <Target className="w-4 h-4" /> },
          { label: 'Proposals Sent', value: `${METRICS.proposalsSent}`, change: METRICS.proposalsSentChange, icon: <Award className="w-4 h-4" /> },
          { label: 'Avg Response', value: `${METRICS.avgResponseTime}d`, change: METRICS.avgResponseTimeChange, icon: <Calendar className="w-4 h-4" />, invertColor: true },
        ].map((kpi) => {
          const positive = kpi.invertColor ? kpi.change < 0 : kpi.change > 0;
          return (
            <div key={kpi.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400">{kpi.icon}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(kpi.change)}%
                </span>
              </div>
              <p className="text-xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Investment chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Monthly Investment
            </h3>
          </div>
          <div className="flex items-end gap-2 h-48">
            {MONTHLY_INVESTMENT.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">${(m.amount / 1000).toFixed(1)}k</span>
                <div className="w-full relative">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(m.amount / maxInvestment) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Investment by Category
            </h3>
          </div>
          <div className="space-y-4">
            {CATEGORY_BREAKDOWN.map((cat) => {
              const pct = Math.round((cat.amount / totalCategoryAmount) * 100);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{cat.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{cat.count} deals</span>
                      <span className="text-white font-medium">${(cat.amount / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal conversion funnel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Deal Conversion Funnel
            </h3>
          </div>
          <div className="space-y-3">
            {FUNNEL_STAGES.map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{stage.stage}</span>
                  <span className="text-white font-medium">{stage.count}</span>
                </div>
                <div className="w-full h-8 bg-slate-800/50 rounded-lg overflow-hidden relative flex items-center">
                  <div
                    className="h-full rounded-lg transition-all bg-gradient-to-r from-emerald-600/80 to-teal-500/60"
                    style={{ width: `${stage.pct}%` }}
                  />
                  <span className="absolute right-3 text-xs text-slate-400">{stage.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing events */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Top Performing Sponsorships
            </h3>
          </div>
          <div className="space-y-3">
            {TOP_PERFORMING.map((ev, i) => (
              <div key={ev.event} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ev.event}</p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{(ev.impressions / 1000).toFixed(0)}k impressions</span>
                    <span>{ev.leads} leads</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{ev.roi}x ROI</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;
