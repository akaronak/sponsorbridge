import React, { useMemo, useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Send,
  Eye,
  Grid3X3,
  List,
  ExternalLink,
} from 'lucide-react';
import type { DiscoverableEvent, EventFilter } from '../../types';
import CredibilityBadge from '../components/CredibilityBadge';
import EventFilterPanel from '../components/EventFilterPanel';
import ProposalModal, { type ProposalFormData } from '../components/ProposalModal';

// ——— Mock discoverable events ——————————————————————————
const MOCK_EVENTS: DiscoverableEvent[] = [
  {
    id: 'e1',
    title: 'HackFest 2026',
    description: 'A 48-hour hackathon bringing together 500+ developers, designers, and entrepreneurs to build innovative solutions.',
    category: 'TECH',
    status: 'PUBLISHED',
    organizerId: 'o1',
    organizerName: 'John Smith',
    date: '2026-03-15',
    endDate: '2026-03-17',
    location: 'San Francisco, CA',
    expectedAttendees: 500,
    budgetRequired: 25000,
    sponsorshipType: 'HYBRID',
    sponsorshipGoal: 20000,
    sponsorshipRaised: 8000,
    applicationDeadline: '2026-03-01',
    tags: ['hackathon', 'tech', 'AI', 'startups'],
    industry: 'TECHNOLOGY',
    credibility: {
      overall: 88, level: 'HIGH',
      factors: { pastPerformance: 23, dealCompletion: 22, responseTime: 18, audienceVerified: 13, ratings: 12 },
      totalEvents: 15, completedDeals: 28, avgRating: 4.7,
    },
    createdAt: '2026-01-10',
  },
  {
    id: 'e2',
    title: 'Spring Career Fair 2026',
    description: 'Connect with top talent from 20+ universities. Perfect for employer branding and recruitment campaigns.',
    category: 'ACADEMIC',
    status: 'PUBLISHED',
    organizerId: 'o2',
    organizerName: 'Sarah Chen',
    date: '2026-04-02',
    location: 'New York, NY',
    expectedAttendees: 2000,
    budgetRequired: 40000,
    sponsorshipType: 'MONETARY',
    sponsorshipGoal: 30000,
    sponsorshipRaised: 18000,
    applicationDeadline: '2026-03-15',
    tags: ['career', 'recruitment', 'university', 'networking'],
    industry: 'EDUCATION',
    credibility: {
      overall: 92, level: 'HIGH',
      factors: { pastPerformance: 24, dealCompletion: 24, responseTime: 19, audienceVerified: 14, ratings: 11 },
      totalEvents: 22, completedDeals: 45, avgRating: 4.8,
    },
    createdAt: '2026-01-05',
  },
  {
    id: 'e3',
    title: 'Music & Arts Festival',
    description: 'Outdoor festival featuring live music, art installations, food trucks, and interactive brand activations.',
    category: 'CULTURAL',
    status: 'PUBLISHED',
    organizerId: 'o3',
    organizerName: 'Mike Johnson',
    date: '2026-04-20',
    endDate: '2026-04-22',
    location: 'Austin, TX',
    expectedAttendees: 5000,
    budgetRequired: 60000,
    sponsorshipType: 'HYBRID',
    sponsorshipGoal: 50000,
    sponsorshipRaised: 12000,
    applicationDeadline: '2026-04-01',
    tags: ['music', 'arts', 'festival', 'outdoor'],
    industry: 'ENTERTAINMENT',
    credibility: {
      overall: 56, level: 'MODERATE',
      factors: { pastPerformance: 14, dealCompletion: 15, responseTime: 12, audienceVerified: 8, ratings: 7 },
      totalEvents: 5, completedDeals: 8, avgRating: 3.9,
    },
    createdAt: '2026-01-20',
  },
  {
    id: 'e4',
    title: 'AI Summit 2026',
    description: 'Two-day conference on cutting-edge AI, machine learning, and data science with keynotes from industry leaders.',
    category: 'TECH',
    status: 'PUBLISHED',
    organizerId: 'o4',
    organizerName: 'Emily Zhang',
    date: '2026-05-10',
    endDate: '2026-05-11',
    location: 'Seattle, WA',
    expectedAttendees: 1200,
    budgetRequired: 45000,
    sponsorshipType: 'MONETARY',
    sponsorshipGoal: 35000,
    sponsorshipRaised: 0,
    applicationDeadline: '2026-04-15',
    tags: ['AI', 'machine-learning', 'data-science', 'conference'],
    industry: 'TECHNOLOGY',
    credibility: {
      overall: 78, level: 'HIGH',
      factors: { pastPerformance: 20, dealCompletion: 19, responseTime: 17, audienceVerified: 12, ratings: 10 },
      totalEvents: 8, completedDeals: 14, avgRating: 4.5,
    },
    createdAt: '2026-02-01',
  },
  {
    id: 'e5',
    title: 'College Sports Championship',
    description: 'Inter-university athletics championship with 300+ athletes and live streaming to 50,000+ viewers.',
    category: 'SPORTS',
    status: 'PUBLISHED',
    organizerId: 'o5',
    organizerName: 'David Wilson',
    date: '2026-06-05',
    endDate: '2026-06-07',
    location: 'Los Angeles, CA',
    expectedAttendees: 8000,
    budgetRequired: 80000,
    sponsorshipType: 'HYBRID',
    sponsorshipGoal: 60000,
    sponsorshipRaised: 25000,
    applicationDeadline: '2026-05-01',
    tags: ['sports', 'college', 'athletics', 'championship'],
    industry: 'SPORTS',
    credibility: {
      overall: 35, level: 'NEW',
      factors: { pastPerformance: 8, dealCompletion: 10, responseTime: 8, audienceVerified: 5, ratings: 4 },
      totalEvents: 2, completedDeals: 3, avgRating: 3.5,
    },
    createdAt: '2026-02-10',
  },
  {
    id: 'e6',
    title: 'HealthTech Expo',
    description: 'Showcasing innovations in healthcare technology, digital health, telemedicine, and wellness solutions.',
    category: 'TECH',
    status: 'PUBLISHED',
    organizerId: 'o6',
    organizerName: 'Dr. Lisa Park',
    date: '2026-05-25',
    location: 'Boston, MA',
    expectedAttendees: 800,
    budgetRequired: 30000,
    sponsorshipType: 'MONETARY',
    sponsorshipGoal: 25000,
    sponsorshipRaised: 5000,
    applicationDeadline: '2026-05-01',
    tags: ['healthtech', 'digital-health', 'expo', 'innovation'],
    industry: 'HEALTHCARE',
    credibility: {
      overall: 67, level: 'MODERATE',
      factors: { pastPerformance: 18, dealCompletion: 16, responseTime: 14, audienceVerified: 10, ratings: 9 },
      totalEvents: 7, completedDeals: 11, avgRating: 4.2,
    },
    createdAt: '2026-02-05',
  },
  {
    id: 'e7',
    title: 'Startup Pitch Night',
    description: 'An evening showcasing 20 early-stage startups to investors, mentors, and corporate partners.',
    category: 'SOCIAL',
    status: 'PUBLISHED',
    organizerId: 'o7',
    organizerName: 'Alex Rivera',
    date: '2026-03-28',
    location: 'Chicago, IL',
    expectedAttendees: 300,
    budgetRequired: 8000,
    sponsorshipType: 'GOODIES',
    sponsorshipGoal: 5000,
    sponsorshipRaised: 2000,
    applicationDeadline: '2026-03-15',
    tags: ['startups', 'pitch', 'investors', 'networking'],
    industry: 'FINANCE',
    credibility: {
      overall: 45, level: 'MODERATE',
      factors: { pastPerformance: 12, dealCompletion: 11, responseTime: 10, audienceVerified: 6, ratings: 6 },
      totalEvents: 4, completedDeals: 5, avgRating: 3.8,
    },
    createdAt: '2026-02-15',
  },
  {
    id: 'e8',
    title: 'Food & Wine Festival',
    description: 'Three-day culinary event featuring local chefs, wine tastings, cooking demos, and food startup showcases.',
    category: 'CULTURAL',
    status: 'PUBLISHED',
    organizerId: 'o8',
    organizerName: 'Maria Garcia',
    date: '2026-07-12',
    endDate: '2026-07-14',
    location: 'Napa Valley, CA',
    expectedAttendees: 3500,
    budgetRequired: 55000,
    sponsorshipType: 'HYBRID',
    sponsorshipGoal: 40000,
    sponsorshipRaised: 15000,
    applicationDeadline: '2026-06-01',
    tags: ['food', 'wine', 'culinary', 'festival'],
    industry: 'FOOD_BEVERAGE',
    credibility: {
      overall: 82, level: 'HIGH',
      factors: { pastPerformance: 21, dealCompletion: 20, responseTime: 17, audienceVerified: 13, ratings: 11 },
      totalEvents: 12, completedDeals: 20, avgRating: 4.6,
    },
    createdAt: '2026-01-25',
  },
];

// ——— Filter logic ——————————————————————————————————————
function applyFilters(events: DiscoverableEvent[], filters: EventFilter): DiscoverableEvent[] {
  let result = [...events];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organizerName.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.eventType?.length) {
    result = result.filter((e) => filters.eventType!.includes(e.category));
  }
  if (filters.industry?.length) {
    result = result.filter((e) => filters.industry!.includes(e.industry));
  }
  if (filters.sponsorshipType?.length) {
    result = result.filter((e) => filters.sponsorshipType!.includes(e.sponsorshipType));
  }
  if (filters.credibilityLevel?.length) {
    result = result.filter((e) => filters.credibilityLevel!.includes(e.credibility.level));
  }
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter((e) => e.location.toLowerCase().includes(loc));
  }
  if (filters.budgetMin != null) {
    result = result.filter((e) => e.budgetRequired >= filters.budgetMin!);
  }
  if (filters.budgetMax != null) {
    result = result.filter((e) => e.budgetRequired <= filters.budgetMax!);
  }
  if (filters.audienceMin != null) {
    result = result.filter((e) => e.expectedAttendees >= filters.audienceMin!);
  }
  if (filters.audienceMax != null) {
    result = result.filter((e) => e.expectedAttendees <= filters.audienceMax!);
  }
  if (filters.dateFrom) {
    result = result.filter((e) => e.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    result = result.filter((e) => e.date <= filters.dateTo!);
  }

  // Sort
  const sortBy = filters.sortBy || 'date';
  const order = filters.sortOrder === 'desc' ? -1 : 1;
  result.sort((a, b) => {
    switch (sortBy) {
      case 'date': return (a.date > b.date ? 1 : -1) * order;
      case 'budget': return (a.budgetRequired - b.budgetRequired) * order;
      case 'audience': return (a.expectedAttendees - b.expectedAttendees) * order;
      case 'credibility': return (a.credibility.overall - b.credibility.overall) * order;
      case 'deadline': return (a.applicationDeadline > b.applicationDeadline ? 1 : -1) * order;
      default: return 0;
    }
  });

  return result;
}

// ——— Page Component ————————————————————————————————————
const CompanyEvents: React.FC = () => {
  const [filters, setFilters] = useState<EventFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<DiscoverableEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<DiscoverableEvent | null>(null);
  const [sentProposals, setSentProposals] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => applyFilters(MOCK_EVENTS, filters), [filters]);

  const handleProposalSubmit = (data: ProposalFormData) => {
    setSentProposals((prev) => new Set(prev).add(data.eventId));
    setSelectedEvent(null);
    // TODO: API call
  };

  const daysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days` : 'Passed';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Discover Events</h1>
          <p className="text-slate-400 mt-1">Find and apply to sponsor high-impact events</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <EventFilterPanel filters={filters} onChange={setFilters} resultCount={filtered.length} />

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              applied={sentProposals.has(event.id)}
              onApply={() => setSelectedEvent(event)}
              onViewDetails={() => setDetailEvent(event)}
              daysUntil={daysUntil}
            />
          ))}
        </div>
      ) : (
        <EventTable
          events={filtered}
          appliedSet={sentProposals}
          onApply={setSelectedEvent}
          daysUntil={daysUntil}
        />
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No events match your filters</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Proposal Modal */}
      {selectedEvent && (
        <ProposalModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSubmit={handleProposalSubmit}
        />
      )}

      {/* Detail Drawer */}
      {detailEvent && (
        <EventDetailDrawer event={detailEvent} onClose={() => setDetailEvent(null)} onApply={() => { setDetailEvent(null); setSelectedEvent(detailEvent); }} applied={sentProposals.has(detailEvent.id)} />
      )}
    </div>
  );
};

// ——— Event Card —————————————————————————————————————————
interface EventCardProps {
  event: DiscoverableEvent;
  applied: boolean;
  onApply: () => void;
  onViewDetails: () => void;
  daysUntil: (d: string) => string;
}

const EventCard: React.FC<EventCardProps> = ({ event, applied, onApply, onViewDetails, daysUntil }) => {
  const progress = Math.round((event.sponsorshipRaised / event.sponsorshipGoal) * 100);
  const typeColors: Record<string, string> = {
    MONETARY: 'bg-emerald-500/10 text-emerald-400',
    GOODIES: 'bg-purple-500/10 text-purple-400',
    HYBRID: 'bg-blue-500/10 text-blue-400',
  };
  const catColors: Record<string, string> = {
    TECH: 'bg-indigo-500/10 text-indigo-400',
    SPORTS: 'bg-orange-500/10 text-orange-400',
    CULTURAL: 'bg-pink-500/10 text-pink-400',
    ACADEMIC: 'bg-cyan-500/10 text-cyan-400',
    SOCIAL: 'bg-violet-500/10 text-violet-400',
    OTHER: 'bg-slate-500/10 text-slate-400',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200 group flex flex-col">
      {/* Header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColors[event.category]}`}>
              {event.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[event.sponsorshipType]}`}>
              {event.sponsorshipType}
            </span>
          </div>
          <CredibilityBadge credibility={event.credibility} size="sm" />
        </div>

        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{event.description}</p>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {event.endDate && <span>- {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span>{event.expectedAttendees.toLocaleString()} expected</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span>${event.budgetRequired.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
            {event.organizerName.charAt(0)}
          </div>
          <span className="text-xs text-slate-400">by {event.organizerName}</span>
        </div>

        {/* Funding progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Raised: ${event.sponsorshipRaised.toLocaleString()}</span>
            <span className="text-slate-400">${event.sponsorshipGoal.toLocaleString()} goal</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 font-medium">Deadline: {daysUntil(event.applicationDeadline)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </button>
        {applied ? (
          <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg">
            <Send className="w-3.5 h-3.5" />
            Applied
          </span>
        ) : (
          <button
            onClick={onApply}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

// ——— Event Table ————————————————————————————————————————
interface EventTableProps {
  events: DiscoverableEvent[];
  appliedSet: Set<string>;
  onApply: (e: DiscoverableEvent) => void;
  daysUntil: (d: string) => string;
}

const EventTable: React.FC<EventTableProps> = ({ events, appliedSet, onApply, daysUntil }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-slate-800">
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Organizer</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Audience</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Budget</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sponsorship</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Credibility</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-white">{event.title}</p>
                <span className="text-xs text-slate-500">{event.category}</span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">{event.organizerName}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  event.sponsorshipType === 'MONETARY' ? 'bg-emerald-500/10 text-emerald-400' :
                  event.sponsorshipType === 'GOODIES' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {event.sponsorshipType}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">{event.location}</td>
              <td className="px-4 py-3 text-sm text-slate-400">{event.expectedAttendees.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-white font-medium">${event.budgetRequired.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className="text-xs text-slate-500">{event.sponsorshipType}</span>
              </td>
              <td className="px-4 py-3">
                <CredibilityBadge credibility={event.credibility} size="sm" />
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-amber-400 font-medium">{daysUntil(event.applicationDeadline)}</span>
              </td>
              <td className="px-4 py-3">
                {appliedSet.has(event.id) ? (
                  <span className="text-xs text-emerald-400">Applied</span>
                ) : (
                  <button
                    onClick={() => onApply(event)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
                  >
                    Apply
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ——— Event Detail Drawer ————————————————————————————————
interface EventDetailDrawerProps {
  event: DiscoverableEvent;
  onClose: () => void;
  onApply: () => void;
  applied: boolean;
}

const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ event, onClose, onApply, applied }) => {
  const progress = Math.round((event.sponsorshipRaised / event.sponsorshipGoal) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-700 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">Event Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400">{event.category}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                event.sponsorshipType === 'MONETARY' ? 'bg-emerald-500/10 text-emerald-400' :
                event.sponsorshipType === 'GOODIES' ? 'bg-purple-500/10 text-purple-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>{event.sponsorshipType}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{event.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<Calendar className="w-4 h-4 text-blue-400" />} label="Date" value={new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            <DetailItem icon={<MapPin className="w-4 h-4 text-red-400" />} label="Location" value={event.location} />
            <DetailItem icon={<Users className="w-4 h-4 text-purple-400" />} label="Expected Audience" value={event.expectedAttendees.toLocaleString()} />
            <DetailItem icon={<DollarSign className="w-4 h-4 text-emerald-400" />} label="Budget Required" value={`$${event.budgetRequired.toLocaleString()}`} />
          </div>

          {/* Funding */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Sponsorship Progress</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>${event.sponsorshipRaised.toLocaleString()} raised</span>
              <span>${event.sponsorshipGoal.toLocaleString()} goal</span>
            </div>
          </div>

          {/* Organizer credibility */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Organizer Credibility</h4>
            <CredibilityBadge credibility={event.credibility} showDetails />
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Apply button */}
          <div className="pt-4 border-t border-slate-800">
            {applied ? (
              <div className="w-full py-3 text-center text-emerald-400 bg-emerald-500/10 rounded-xl text-sm font-medium">
                Proposal Sent
              </div>
            ) : (
              <button
                onClick={onApply}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
                Send Sponsorship Proposal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-slate-800/30 rounded-lg p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-slate-500">{label}</span>
    </div>
    <p className="text-sm text-white font-medium">{value}</p>
  </div>
);

export default CompanyEvents;
