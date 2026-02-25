import React, { useState } from 'react';
import {
  Search,
  Filter,
  Building2,
  Globe,
  DollarSign,
  Star,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { SponsorTier } from '../../types';

// �"��"��"� Mock data �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
const mockSponsors = [
  {
    id: '1',
    companyName: 'TechCorp Inc.',
    industry: 'Technology',
    contactName: 'Sarah Chen',
    contactEmail: 'sarah@techcorp.com',
    website: 'https://techcorp.com',
    description: 'Leading cloud infrastructure provider focused on developer tools and AI platforms.',
    budget: 50000,
    interests: ['AI', 'Hackathons', 'Developer Events'],
    tier: 'PLATINUM' as SponsorTier,
    totalSponsored: 12,
    activeDeals: 3,
    matchScore: 96,
  },
  {
    id: '2',
    companyName: 'InnovateCo',
    industry: 'SaaS',
    contactName: 'James Rodriguez',
    contactEmail: 'james@innovateco.io',
    website: 'https://innovateco.io',
    description: 'B2B SaaS platform for enterprise workflow automation and analytics.',
    budget: 30000,
    interests: ['Tech', 'Career Fairs', 'Startups'],
    tier: 'GOLD' as SponsorTier,
    totalSponsored: 8,
    activeDeals: 2,
    matchScore: 89,
  },
  {
    id: '3',
    companyName: 'BrandLabs',
    industry: 'Marketing',
    contactName: 'Emily Watson',
    contactEmail: 'emily@brandlabs.com',
    website: 'https://brandlabs.com',
    description: 'Creative agency specializing in experiential marketing and brand activations.',
    budget: 20000,
    interests: ['Arts', 'Music', 'Cultural Events'],
    tier: 'SILVER' as SponsorTier,
    totalSponsored: 5,
    activeDeals: 1,
    matchScore: 78,
  },
  {
    id: '4',
    companyName: 'GreenEnergy Co',
    industry: 'Clean Energy',
    contactName: 'Michael Park',
    contactEmail: 'michael@greenenergy.co',
    website: 'https://greenenergy.co',
    description: 'Renewable energy solutions for sustainable campus environments.',
    budget: 15000,
    interests: ['Sustainability', 'Academic', 'Research'],
    tier: 'GOLD' as SponsorTier,
    totalSponsored: 3,
    activeDeals: 1,
    matchScore: 85,
  },
  {
    id: '5',
    companyName: 'FinanceHub',
    industry: 'Fintech',
    contactName: 'Anna Liu',
    contactEmail: 'anna@financehub.com',
    website: 'https://financehub.com',
    description: 'Modern banking and financial tools for the next generation.',
    budget: 40000,
    interests: ['Business', 'Career', 'Networking'],
    tier: 'PLATINUM' as SponsorTier,
    totalSponsored: 10,
    activeDeals: 2,
    matchScore: 91,
  },
];

const tierColors: Record<SponsorTier, string> = {
  PLATINUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  GOLD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SILVER: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
  BRONZE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const Sponsors: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<SponsorTier | 'ALL'>('ALL');

  const filtered = mockSponsors.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sponsors</h1>
          <p className="text-slate-400 text-sm mt-1">Discover and manage sponsor relationships</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
          <Sparkles className="w-4 h-4" />
          AI Match
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sponsors..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {(['ALL', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tierFilter === tier
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : tier.charAt(0) + tier.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {sponsor.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">{sponsor.industry}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${tierColors[sponsor.tier]}`}>
                {sponsor.tier}
              </span>
            </div>

            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{sponsor.description}</p>

            {/* Match score */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
              <Star className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">{sponsor.matchScore}% Match</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-2">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${sponsor.matchScore}%` }}
                />
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {sponsor.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400"
                >
                  {interest}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              <div>
                <p className="text-xs text-slate-500">Budget</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span className="text-sm text-white font-medium">{(sponsor.budget / 1000).toFixed(0)}K</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Sponsored</p>
                <p className="text-sm text-white font-medium mt-0.5">{sponsor.totalSponsored}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Active</p>
                <p className="text-sm text-emerald-400 font-medium mt-0.5">{sponsor.activeDeals}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-all">
                Send Proposal
              </button>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={`https://${sponsor.website?.replace('https://', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No sponsors found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Sponsors;
