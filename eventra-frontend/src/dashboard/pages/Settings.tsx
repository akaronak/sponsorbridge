import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'appearance';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    organization: '',
    website: '',
  });

  // Sync form when the authenticated user changes (e.g. account switch)
  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
    }));
  }, [user?.id, user?.name, user?.email]);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role} Account</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    placeholder="Your organization"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell sponsors about yourself..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
              {[
                { label: 'New sponsor matches', desc: 'Get notified when AI finds potential sponsors', enabled: true },
                { label: 'Sponsorship requests', desc: 'Alerts for incoming sponsorship proposals', enabled: true },
                { label: 'Messages', desc: 'Notifications for new messages from sponsors', enabled: true },
                { label: 'Event reminders', desc: 'Reminders about upcoming event deadlines', enabled: false },
                { label: 'Weekly digest', desc: 'Summary of your weekly performance metrics', enabled: true },
                { label: 'Marketing emails', desc: 'Product updates, tips, and announcements', enabled: false },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{pref.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                  </div>
                  <button className={`w-11 h-6 rounded-full transition-all ${pref.enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      Current Password
                    </div>
                  </label>
                  <input type="password" placeholder="********" className="w-full max-w-md px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <input type="password" placeholder="********" className="w-full max-w-md px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="********" className="w-full max-w-md px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all">
                  <Lock className="w-4 h-4" />
                  Update Password
                </button>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h3 className="text-sm font-medium text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-500 mb-3">Add an extra layer of security to your account.</p>
                <button className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Billing & Subscription</h2>
              <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-400">Professional Plan</p>
                    <p className="text-xs text-slate-500 mt-0.5">$299/month * Renews Mar 22, 2026</p>
                  </div>
                  <button className="px-4 py-2 border border-indigo-500/30 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    Manage Plan
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Payment Method</h3>
                <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl max-w-md">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-white">**** **** **** 4242</span>
                  <span className="text-xs text-slate-500 ml-auto">Expires 12/27</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Theme</h3>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'dark', label: 'Dark', active: true },
                    { id: 'light', label: 'Light', active: false },
                    { id: 'system', label: 'System', active: false },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        theme.active
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Accent Color</h3>
                <div className="flex items-center gap-2">
                  {['bg-indigo-500', 'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} ${
                        color === 'bg-indigo-500' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      } hover:scale-110 transition-transform`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
