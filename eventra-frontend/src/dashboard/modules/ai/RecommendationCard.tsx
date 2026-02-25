import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import type { AIRecommendation } from '../../../types';

// �"��"��"� Mock recommendations �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
const mockRecommendations: (AIRecommendation & { icon: React.ReactNode })[] = [
  {
    id: '1',
    type: 'SPONSOR_MATCH',
    title: 'New High-Value Match',
    description:
      'TechCorp Inc. has increased their sponsorship budget by 40%. They\'re now a 96% match for your HackFest 2026.',
    confidence: 96,
    impact: 'HIGH',
    actionable: true,
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: '2',
    type: 'PRICING_SUGGESTION',
    title: 'Increase Platinum Tier Price',
    description:
      'Market analysis shows your Platinum tier is priced 15% below similar events. Raising to $12,000 could increase revenue without affecting conversion.',
    confidence: 88,
    impact: 'HIGH',
    actionable: true,
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: '3',
    type: 'EVENT_OPTIMIZATION',
    title: 'Optimize Event Description',
    description:
      'Your Career Fair listing is missing key tags. Adding "networking", "tech", and "internships" could increase visibility by 35%.',
    confidence: 82,
    impact: 'MEDIUM',
    actionable: true,
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    id: '4',
    type: 'MARKET_INSIGHT',
    title: 'Clean Energy Sector Growth',
    description:
      'Clean energy companies have increased campus sponsorship budgets by 28% this quarter. Consider targeting this sector.',
    confidence: 79,
    impact: 'MEDIUM',
    actionable: false,
    icon: <Sparkles className="w-5 h-5" />,
  },
];

const impactColors = {
  HIGH: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const RecommendationCard: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
        </div>
        <span className="text-xs text-slate-500">Updated 2h ago</span>
      </div>

      <div className="space-y-3">
        {mockRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0 mt-0.5">
                {rec.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${impactColors[rec.impact]}`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{rec.description}</p>

                {/* Confidence bar */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 max-w-[120px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{rec.confidence}% confidence</span>
                </div>

                {rec.actionable && (
                  <button className="flex items-center gap-1.5 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Take Action <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCard;
