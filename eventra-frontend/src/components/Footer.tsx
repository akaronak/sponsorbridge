import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin, Twitter, Github } from 'lucide-react';
import { BRAND } from '../config/branding';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const supportEmail = BRAND.supportEmail;

  return (
    <footer className="bg-[#0b1120] border-t border-white/[0.06] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity mb-4 block">
              {BRAND.name}
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Intelligent sponsorship matching platform for college events and passionate brands.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-slate-400 hover:text-white transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-400 hover:text-white transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-400 hover:text-white transition-colors duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href={`mailto:${supportEmail}`}
                aria-label="Support Email"
                className="text-slate-400 hover:text-white transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/features" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Pricing
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/security" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Security
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Blog
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <a 
                  href={`mailto:${BRAND.careersEmail}`}
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Careers
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Privacy Policy
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Terms of Service
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm relative group"
                >
                  Contact
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`mailto:${supportEmail}`}
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                >
                  <Mail className="w-4 h-4" />
                  <span className="relative">
                    Contact Support
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </a>
              </li>
              <li className="text-slate-500 text-xs">
                Response time: 24 hours
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-xs">
              <p>&copy; {currentYear} {BRAND.name}. All rights reserved.</p>
              <p className="text-slate-600 mt-1">Version 1.0.0 | San Francisco, CA</p>
            </div>
            <div className="flex gap-4 text-slate-500 text-xs">
              <a href={`mailto:${supportEmail}`} className="hover:text-slate-300 transition-colors">
                {supportEmail}
              </a>
              <span>•</span>
              <a href="tel:+1-555-000-0000" className="hover:text-slate-300 transition-colors">
                +1 (555) 000-0000
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
