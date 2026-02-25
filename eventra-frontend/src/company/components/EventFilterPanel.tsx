import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search,
  SlidersHorizontal,

  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import type { EventCategory, EventFilter, IndustryType, SponsorshipType, CredibilityLevel } from '../../types';

interface EventFilterPanelProps {
  filters: EventFilter;
  onChange: (filters: EventFilter) => void;
  resultCount: number;
}

const EVENT_TYPES: { value: EventCategory; label: string }[] = [
  { value: 'TECH', label: 'Technology' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'OTHER', label: 'Other' },
];

const INDUSTRIES: { value: IndustryType; label: string }[] = [
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'FOOD_BEVERAGE', label: 'Food & Beverage' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'OTHER', label: 'Other' },
];

const SPONSORSHIP_TYPES: { value: SponsorshipType; label: string }[] = [
  { value: 'MONETARY', label: 'Monetary' },
  { value: 'GOODIES', label: 'Goodies' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const CREDIBILITY_LEVELS: { value: CredibilityLevel; label: string; color: string }[] = [
  { value: 'HIGH', label: 'High Credibility', color: 'text-emerald-400' },
  { value: 'MODERATE', label: 'Moderate', color: 'text-amber-400' },
  { value: 'NEW', label: 'New Organizer', color: 'text-blue-400' },
];

const EventFilterPanel: React.FC<EventFilterPanelProps> = ({
  filters,
  onChange,
  resultCount,
}) => {
  const [expanded, setExpanded] = useState(true);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchRef.current) clearTimeout(searchRef.current);
      searchRef.current = setTimeout(() => {
        onChange({ ...filters, search: value || undefined });
      }, 300);
    },
    [filters, onChange]
  );

  useEffect(() => {
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, []);

  const toggleArrayFilter = <T extends string>(
    key: keyof EventFilter,
    value: T
  ) => {
    const current = (filters[key] as T[] | undefined) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
  };

  const activeFilterCount = [
    filters.eventType?.length,
    filters.industry?.length,
    filters.sponsorshipType?.length,
    filters.credibilityLevel?.length,
    filters.location ? 1 : 0,
    filters.budgetMin || filters.budgetMax ? 1 : 0,
    filters.audienceMin || filters.audienceMax ? 1 : 0,
    filters.dateFrom || filters.dateTo ? 1 : 0,
  ].filter(Boolean).length;

  const resetFilters = () => {
    onChange({ search: filters.search });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search events by name, organizer, location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Filter toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">
            Advanced Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{resultCount} events</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Filter body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800/50">
          {/* Row 1: Event Type + Sponsorship Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Event Type */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Event Type</label>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map((et) => {
                  const active = filters.eventType?.includes(et.value);
                  return (
                    <button
                      key={et.value}
                      onClick={() => toggleArrayFilter('eventType', et.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {et.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sponsorship Type */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Sponsorship Type</label>
              <div className="flex flex-wrap gap-1.5">
                {SPONSORSHIP_TYPES.map((st) => {
                  const active = filters.sponsorshipType?.includes(st.value);
                  return (
                    <button
                      key={st.value}
                      onClick={() => toggleArrayFilter('sponsorshipType', st.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Industry + Credibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Industry</label>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map((ind) => {
                  const active = filters.industry?.includes(ind.value);
                  return (
                    <button
                      key={ind.value}
                      onClick={() => toggleArrayFilter('industry', ind.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credibility */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Credibility Score</label>
              <div className="flex flex-wrap gap-1.5">
                {CREDIBILITY_LEVELS.map((cl) => {
                  const active = filters.credibilityLevel?.includes(cl.value);
                  return (
                    <button
                      key={cl.value}
                      onClick={() => toggleArrayFilter('credibilityLevel', cl.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? `${cl.value === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : cl.value === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'} border`
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {cl.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Location + Budget Range + Audience Size + Date */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Location</label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
                placeholder="City or region..."
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Budget Range */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Budget Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.budgetMin || ''}
                  onChange={(e) => onChange({ ...filters, budgetMin: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Min"
                  className="w-full px-2 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  value={filters.budgetMax || ''}
                  onChange={(e) => onChange({ ...filters, budgetMax: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Max"
                  className="w-full px-2 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Audience Size */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Audience Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.audienceMin || ''}
                  onChange={(e) => onChange({ ...filters, audienceMin: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Min"
                  className="w-full px-2 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  value={filters.audienceMax || ''}
                  onChange={(e) => onChange({ ...filters, audienceMax: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Max"
                  className="w-full px-2 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Event Date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
                  className="w-full px-2 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
                  className="w-full px-2 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Sort + Reset row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-400">Sort by</label>
              <select
                value={filters.sortBy || 'date'}
                onChange={(e) => onChange({ ...filters, sortBy: e.target.value as EventFilter['sortBy'] })}
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="date">Event Date</option>
                <option value="budget">Budget</option>
                <option value="audience">Audience</option>
                <option value="credibility">Credibility</option>
                <option value="deadline">Deadline</option>
              </select>
              <select
                value={filters.sortOrder || 'asc'}
                onChange={(e) => onChange({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilterPanel;
