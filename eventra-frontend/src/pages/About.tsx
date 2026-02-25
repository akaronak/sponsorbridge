import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">About {import.meta.env.VITE_APP_NAME || 'Eventra'}</h1>
          
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
            <p>
              {import.meta.env.VITE_APP_NAME || 'Eventra'} was founded with a mission to simplify sponsorship matching for college events and passionate brands worldwide.
            </p>
            
            <p>
              We recognized a critical gap in the market: while thousands of college events struggle to find sponsors, brands miss out on authentic engagement opportunities with passionate communities. Our AI-powered platform bridges this gap with intelligent matching.
            </p>

            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Our Mission</h3>
            <p>
              Empower college communities to create unforgettable events while enabling brands to discover meaningful sponsorship opportunities aligned with their values.
            </p>

            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Team</h3>
            <p>
              Built by a passionate team of engineers, product designers, and sponsorship experts with decades of combined experience in education technology and marketing.
            </p>

            <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <p className="text-indigo-300">
                Join 120+ college events that are already using {import.meta.env.VITE_APP_NAME || 'Eventra'} to secure sponsorships and create amazing experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
