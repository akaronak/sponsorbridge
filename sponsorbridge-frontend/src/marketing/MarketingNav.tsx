import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MarketingNav: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b1120]/60 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-300"
        >
          Eventra
        </Link>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="group flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-white/[0.06] border border-white/[0.1] rounded-lg hover:bg-white/[0.1] hover:border-white/[0.16] transition-all duration-200"
          >
            Register
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MarketingNav;
