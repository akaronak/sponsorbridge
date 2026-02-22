import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mb-8">Effective Date: January 1, 2026 | Last Updated: February 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                SponsorBridge ("we", "our", or "us") operates the SponsorBridge website and application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information Collection</h2>
              <p>
                We collect information that you provide directly to us, such as when you create an account, complete a profile, or contact our support team. This may include your name, email address, phone number, and other professional information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Use of Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our Services, process transactions, send transactional and promotional communications, and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data. You may also request a copy of your data or restrict our processing. To exercise these rights, please contact us at privacy@sponsorbridge.app.
              </p>
            </section>

            <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm">
                For questions about this Privacy Policy, contact us at <a href="mailto:privacy@sponsorbridge.app" className="text-indigo-400 hover:text-indigo-300">privacy@sponsorbridge.app</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
