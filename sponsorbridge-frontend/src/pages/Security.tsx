import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

const Security: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Security & Compliance</h1>
          <p className="text-slate-300 text-lg mb-12">Enterprise-grade security protecting your data.</p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <Shield className="w-12 h-12 text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">End-to-End Encryption</h3>
                <p className="text-slate-400">All data transmitted with TLS 1.3 encryption standard.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <Lock className="w-12 h-12 text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">GDPR Compliant</h3>
                <p className="text-slate-400">Full compliance with GDPR and international data protection regulations.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <Eye className="w-12 h-12 text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Regular Audits</h3>
                <p className="text-slate-400">Third-party security audits and penetration testing quarterly.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm">
              <strong>SOC 2 Type II Certified</strong> • <strong>ISO 27001</strong> • <strong>HIPAA Compliant</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
