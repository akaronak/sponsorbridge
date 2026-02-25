import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
            <h1 className="text-4xl font-bold text-white mb-2">Get in Touch</h1>
            <p className="text-slate-400 mb-12">We're here to help and answer any questions you might have.</p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@example.com'}`} className="text-slate-400 hover:text-indigo-400 transition">
                    {import.meta.env.VITE_SUPPORT_EMAIL || 'support@example.com'}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Phone</h3>
                  <a href="tel:+1-555-000-0000" className="text-slate-400 hover:text-indigo-400 transition">
                    +1 (555) 000-0000
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Address</h3>
                  <p className="text-slate-400">
                    {import.meta.env.VITE_LEGAL_ENTITY || 'Your Company Inc.'}<br />
                    123 Market St, Suite 100<br />
                    San Francisco, CA 94102
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <h4 className="text-indigo-300 font-semibold mb-2">Response Time</h4>
              <p className="text-indigo-200 text-sm">We typically respond to all inquiries within 24 hours, Monday-Friday 9 AM-5 PM PT.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg">
                Thank you! Your message has been sent successfully. We'll be in touch soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold mt-2"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
