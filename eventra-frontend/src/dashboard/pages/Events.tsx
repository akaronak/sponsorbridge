import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import type { EventStatus } from '../../types';

// �"��"��"� Mock data �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
const mockEvents = [
  {
    id: '1',
    title: 'HackFest 2026',
    description: 'Annual 48-hour hackathon bringing together 500+ developers',
    category: 'TECH' as const,
    status: 'ACTIVE' as EventStatus,
    date: '2026-03-15',
    location: 'Stanford University',
    expectedAttendees: 500,
    sponsorshipGoal: 15000,
    sponsorshipRaised: 12000,
    tags: ['hackathon', 'tech', 'coding'],
  },
  {
    id: '2',
    title: 'Spring Career Fair',
    description: 'Connect students with top employers across industries',
    category: 'ACADEMIC' as const,
    status: 'PUBLISHED' as EventStatus,
    date: '2026-04-02',
    location: 'MIT Campus Center',
    expectedAttendees: 1200,
    sponsorshipGoal: 30000,
    sponsorshipRaised: 24500,
    tags: ['career', 'networking', 'jobs'],
  },
  {
    id: '3',
    title: 'Music & Arts Festival',
    description: 'Three-day campus festival celebrating creativity and expression',
    category: 'CULTURAL' as const,
    status: 'DRAFT' as EventStatus,
    date: '2026-04-20',
    location: 'UCLA Sunset Rec',
    expectedAttendees: 2000,
    sponsorshipGoal: 20000,
    sponsorshipRaised: 5000,
    tags: ['music', 'arts', 'festival'],
  },
  {
    id: '4',
    title: 'AI Research Symposium',
    description: 'Showcase cutting-edge AI research from top universities',
    category: 'TECH' as const,
    status: 'COMPLETED' as EventStatus,
    date: '2026-01-20',
    location: 'Carnegie Mellon',
    expectedAttendees: 300,
    sponsorshipGoal: 10000,
    sponsorshipRaised: 10000,
    tags: ['ai', 'research', 'academic'],
  },
];

const statusColors: Record<EventStatus, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  PUBLISHED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const Events: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your events and track sponsorship progress</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
          <Plus className="w-4 h-4" />
          New Event
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
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {(['ALL', 'DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[event.status]}`}>
                {event.status}
              </span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === event.id ? null : event.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen === event.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-20">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800/50">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{event.description}</p>

            {/* Meta */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarIcon className="w-3.5 h-3.5" />
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="w-3.5 h-3.5" />
                {event.expectedAttendees.toLocaleString()} expected
              </div>
            </div>

            {/* Progress */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white font-medium">
                    ${event.sponsorshipRaised.toLocaleString()}
                  </span>
                  <span className="text-slate-500">/ ${event.sponsorshipGoal.toLocaleString()}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {Math.round((event.sponsorshipRaised / event.sponsorshipGoal) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (event.sponsorshipRaised / event.sponsorshipGoal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Events;
