import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  MessageSquare,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Events', path: '/dashboard/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Sponsors', path: '/dashboard/sponsors', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Messages', path: '/dashboard/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Payments', path: '/dashboard/payments', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'AI Assistant', path: '/dashboard/ai', icon: <Bot className="w-5 h-5" /> },
  ];

  const bottomItems: NavItem[] = [
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 z-30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
              Eventra
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
              isActive(item.path)
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {item.badge && item.badge > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

        {/* AI Assistant highlight */}
        {!collapsed && (
          <div className="mt-4 mx-1 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">AI Insights</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get smart sponsor matches and event optimization tips.
            </p>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 py-3 px-3 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* User info */}
        {user && (
          <div className={`flex items-center gap-3 px-3 py-2 mt-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all duration-200 mt-1"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
