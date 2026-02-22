import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Globe,
  MapPin,
  Save,
  Bell,
  Shield,
  Camera,
  Target,
  CheckCircle2,
} from 'lucide-react';
import type { IndustryType, SponsorshipType } from '../../types';

interface CompanySettingsData {
  name: string;
  email: string;
  website: string;
  location: string;
  description: string;
  industry: IndustryType;
  companySize: string;
  logo: string;
  sponsorshipBudgetMin: number;
  sponsorshipBudgetMax: number;
  preferredTypes: SponsorshipType[];
  preferredCategories: string[];
  notifyNewEvents: boolean;
  notifyProposalUpdates: boolean;
  notifyMessages: boolean;
  notifyDeals: boolean;
  emailDigest: 'DAILY' | 'WEEKLY' | 'NEVER';
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'VERIFIED_ONLY';
}

const INITIAL_SETTINGS: CompanySettingsData = {
  name: 'TechVenture Corp',
  email: 'sponsors@techventure.com',
  website: 'https://techventure.com',
  location: 'San Francisco, CA',
  description: 'Leading technology company focused on innovation and community partnerships. We believe in empowering the next generation through event sponsorships.',
  industry: 'TECHNOLOGY',
  companySize: '500-1000',
  logo: '',
  sponsorshipBudgetMin: 5000,
  sponsorshipBudgetMax: 50000,
  preferredTypes: ['MONETARY', 'HYBRID'],
  preferredCategories: ['HACKATHON', 'CONFERENCE', 'WORKSHOP'],
  notifyNewEvents: true,
  notifyProposalUpdates: true,
  notifyMessages: true,
  notifyDeals: true,
  emailDigest: 'DAILY',
  profileVisibility: 'PUBLIC',
};

const INDUSTRIES: { value: IndustryType; label: string }[] = [
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HEALTHCARE', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'FOOD_BEVERAGE', label: 'Food & Beverage' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'OTHER', label: 'Other' },
];

const EVENT_CATEGORIES = ['HACKATHON', 'CONFERENCE', 'WORKSHOP', 'CAREER_FAIR', 'CULTURAL', 'SPORTS'];

const CompanySettings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettingsData>(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');

  const update = <K extends keyof CompanySettingsData>(key: K, value: CompanySettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleArrayItem = <K extends keyof CompanySettingsData>(
    key: K,
    item: string
  ) => {
    setSettings((prev) => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] };
    });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Company Profile', icon: <Building2 className="w-4 h-4" /> },
    { id: 'preferences' as const, label: 'Sponsorship Preferences', icon: <Target className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security' as const, label: 'Security & Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your company profile and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved ? 'bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
              {settings.name.charAt(0)}
            </div>
            <div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all">
                <Camera className="w-4 h-4" />
                Change Logo
              </button>
              <p className="text-xs text-slate-500 mt-1.5">JPG, PNG. Max 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={settings.name} onChange={(e) => update('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="url" value={settings.website} onChange={(e) => update('website', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={settings.location} onChange={(e) => update('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Industry</label>
              <select value={settings.industry} onChange={(e) => update('industry', e.target.value as IndustryType)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Company Size</label>
              <select value={settings.companySize} onChange={(e) => update('companySize', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                {['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'].map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Company Description</label>
            <textarea value={settings.description} onChange={(e) => update('description', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none" />
          </div>
        </div>
      )}

      {/* Preferences tab */}
      {activeTab === 'preferences' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Budget Range</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Minimum ($)</label>
                <input type="number" value={settings.sponsorshipBudgetMin} onChange={(e) => update('sponsorshipBudgetMin', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Maximum ($)</label>
                <input type="number" value={settings.sponsorshipBudgetMax} onChange={(e) => update('sponsorshipBudgetMax', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Preferred Sponsorship Types</h3>
            <div className="flex gap-2">
              {(['MONETARY', 'GOODIES', 'HYBRID'] as SponsorshipType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayItem('preferredTypes', type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.preferredTypes.includes(type)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Preferred Event Categories</h3>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleArrayItem('preferredCategories', cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    settings.preferredCategories.includes(cat)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-white mb-1">Push Notifications</h3>
          <div className="space-y-3">
            {([
              { key: 'notifyNewEvents' as const, label: 'New matching events', desc: 'Get notified when events matching your preferences are listed' },
              { key: 'notifyProposalUpdates' as const, label: 'Proposal updates', desc: 'Status changes on your submitted proposals' },
              { key: 'notifyMessages' as const, label: 'Messages', desc: 'New messages from organizers' },
              { key: 'notifyDeals' as const, label: 'Deal updates', desc: 'Deliverable completions and deal milestones' },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => update(item.key, !settings[item.key])}
                  className={`w-11 h-6 rounded-full transition-all relative ${settings[item.key] ? 'bg-emerald-600' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[item.key] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Email Digest</h3>
            <div className="flex gap-2">
              {(['DAILY', 'WEEKLY', 'NEVER'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => update('emailDigest', freq)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.emailDigest === freq ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {freq.charAt(0) + freq.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Profile Visibility</h3>
            <div className="space-y-2">
              {([
                { value: 'PUBLIC' as const, label: 'Public', desc: 'Visible to all organizers on the platform' },
                { value: 'VERIFIED_ONLY' as const, label: 'Verified Only', desc: 'Only visible to verified organizers' },
                { value: 'PRIVATE' as const, label: 'Private', desc: 'Only visible when you send a proposal' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update('profileVisibility', opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    settings.profileVisibility === opt.value
                      ? 'bg-emerald-600/10 border border-emerald-500/30'
                      : 'bg-slate-800/30 border border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    settings.profileVisibility === opt.value ? 'border-emerald-400' : 'border-slate-600'
                  }`}>
                    {settings.profileVisibility === opt.value && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-white">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all">
                Change Password
              </button>
              <button className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-xl transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
