import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Features</h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-12">
            Discover the powerful features that make {import.meta.env.VITE_APP_NAME || 'Eventra'} the leading sponsorship matching platform for college events.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-slate-700 rounded-lg p-6 hover:border-indigo-500/50 transition">
              <h3 className="text-xl font-semibold text-white mb-3">Intelligent Matching</h3>
              <p className="text-slate-400">AI-powered algorithm matches events with the perfect sponsors based on goals and audience.</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-6 hover:border-indigo-500/50 transition">
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Analytics</h3>
              <p className="text-slate-400">Track sponsorship performance with detailed metrics and ROI insights.</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-6 hover:border-indigo-500/50 transition">
              <h3 className="text-xl font-semibold text-white mb-3">Secure Transactions</h3>
              <p className="text-slate-400">End-to-end encryption and compliance with industry standards.</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-6 hover:border-indigo-500/50 transition">
              <h3 className="text-xl font-semibold text-white mb-3">24/7 Support</h3>
              <p className="text-slate-400">Dedicated support team ready to help you succeed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
