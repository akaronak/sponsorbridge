import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PremiumHero from '../components/PremiumHero';
import FeaturesShowcase from '../components/FeaturesShowcase';
import WorkflowTimeline from '../components/WorkflowTimeline';
import SocialProof from '../components/SocialProof';
import HowItWorks from '../components/HowItWorks';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Bar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            SponsorBridge
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-all duration-200 active:scale-97">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/dashboard" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150">Dashboard</Link>
                  <Link to="/dashboard/settings" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150">Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 transition-all duration-150">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-all duration-200">Sign In</Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 active:scale-97">Register</Link>
              </>
            )}
            <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-white transition-all duration-200">
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden bg-slate-900/80 border-t border-slate-800 px-4 py-4 space-y-2">
            <a href="#features" className="block text-slate-300 hover:text-white py-2">Features</a>
            <a href="#how-it-works" className="block text-slate-300 hover:text-white py-2">How It Works</a>
            <a href="#pricing" className="block text-slate-300 hover:text-white py-2">Pricing</a>
          </div>
        )}
      </nav>


      {/* Landing Page Components */}
      <PremiumHero />
      <FeaturesShowcase />
      <WorkflowTimeline />
      <SocialProof />
      <HowItWorks />
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
