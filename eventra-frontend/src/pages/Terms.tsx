import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BRAND } from '../config/branding';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm mb-8">Effective Date: January 1, 2026 | Last Updated: February 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the {BRAND.name} platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on {BRAND.name} for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
              <p>
                The materials on {BRAND.name} are provided "as is". {BRAND.name} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
              <p>
                In no event shall {BRAND.name} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {BRAND.name}.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Revisions</h2>
              <p>
                {BRAND.name} may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm">
                Questions about the Terms of Service? Contact us at <a href={`mailto:${BRAND.legalEmail}`} className="text-indigo-400 hover:text-indigo-300">{BRAND.legalEmail}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
