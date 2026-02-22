import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Star, Clock, Users, CheckCircle2 } from 'lucide-react';
import type { CredibilityScore } from '../../types';

interface CredibilityBadgeProps {
  credibility: CredibilityScore;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const levelConfig = {
  HIGH: {
    label: 'High Credibility',
    color: 'emerald',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: ShieldCheck,
    description: 'Verified organizer with excellent track record',
  },
  MODERATE: {
    label: 'Moderate',
    color: 'amber',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: Shield,
    description: 'Established organizer with good history',
  },
  NEW: {
    label: 'New Organizer',
    color: 'blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: ShieldAlert,
    description: 'New to the platform — limited history',
  },
};

const CredibilityBadge: React.FC<CredibilityBadgeProps> = ({
  credibility,
  size = 'md',
  showDetails = false,
}) => {
  const cfg = levelConfig[credibility.level];
  const Icon = cfg.icon;

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border} border`}
        title={`${cfg.label} — Score: ${credibility.overall}/100`}
      >
        <Icon className="w-3 h-3" />
        {credibility.overall}
      </span>
    );
  }

  return (
    <div className={`${cfg.bg} ${cfg.border} border rounded-xl p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${cfg.text}`} />
          <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
        </div>
        <div className={`text-lg font-bold ${cfg.text}`}>
          {credibility.overall}<span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            credibility.level === 'HIGH' ? 'bg-emerald-500' :
            credibility.level === 'MODERATE' ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${credibility.overall}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 mb-3">{cfg.description}</p>

      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-slate-700/50">
          <ScoreFactor
            icon={<Star className="w-3.5 h-3.5 text-amber-400" />}
            label="Past Performance"
            score={credibility.factors.pastPerformance}
            max={25}
          />
          <ScoreFactor
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            label="Deal Completion"
            score={credibility.factors.dealCompletion}
            max={25}
          />
          <ScoreFactor
            icon={<Clock className="w-3.5 h-3.5 text-blue-400" />}
            label="Response Time"
            score={credibility.factors.responseTime}
            max={20}
          />
          <ScoreFactor
            icon={<Users className="w-3.5 h-3.5 text-purple-400" />}
            label="Audience Verified"
            score={credibility.factors.audienceVerified}
            max={15}
          />
          <ScoreFactor
            icon={<Star className="w-3.5 h-3.5 text-teal-400" />}
            label="Ratings"
            score={credibility.factors.ratings}
            max={15}
          />

          {/* Extra info */}
          <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-xs text-slate-500">Events</p>
              <p className="text-sm font-bold text-white">{credibility.totalEvents}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Deals Done</p>
              <p className="text-sm font-bold text-white">{credibility.completedDeals}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Avg Rating</p>
              <p className="text-sm font-bold text-white">{credibility.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ——— Sub-components ——————————————————————————————————

interface ScoreFactorProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  max: number;
}

const ScoreFactor: React.FC<ScoreFactorProps> = ({ icon, label, score, max }) => {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-slate-400 w-28">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-10 text-right">{score}/{max}</span>
    </div>
  );
};

export default CredibilityBadge;

// ——— Utility: compute credibility level from score ——
export function computeCredibilityLevel(score: number): 'HIGH' | 'MODERATE' | 'NEW' {
  if (score >= 75) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'NEW';
}

// ——— Utility: calculate credibility from factors ————
export function calculateCredibility(factors: CredibilityScore['factors']): number {
  return (
    factors.pastPerformance +
    factors.dealCompletion +
    factors.responseTime +
    factors.audienceVerified +
    factors.ratings
  );
}
