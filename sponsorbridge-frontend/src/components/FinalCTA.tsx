import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const FinalCTA: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Subtle glow animation on button
    if (buttonRef.current) {
      const button = buttonRef.current;
      button.addEventListener('mouseenter', () => {
        button.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.4), 0 0 15px rgba(59, 130, 246, 0.2)';
      });
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 px-6 sm:px-12 bg-gradient-to-b from-slate-950 via-slate-900 to-black overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-5xl sm:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
          Stop Searching for Sponsors.
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Start Matching Smartly.
          </span>
        </h2>

        {/* Supporting text */}
        <p className="text-slate-300 text-lg sm:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
          Join 120+ college events already securing sponsorships through intelligent matching. 
          Turn event organizing into sponsorship success.
        </p>

        {/* CTA Button with glow effect */}
        <div className="flex justify-center">
          <button
            ref={buttonRef}
            className="group relative px-12 py-6 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 active:scale-97 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.4), 0 0 15px rgba(59, 130, 246, 0.2)'
            }}
          >
            {/* Accent border glow */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.2), transparent)',
                pointerEvents: 'none'
              }}
            ></div>

            {/* Button content */}
            <div className="relative flex items-center gap-3 whitespace-nowrap">
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
            </div>
          </button>
        </div>

        {/* Secondary trust text */}
        <p className="text-slate-500 text-sm mt-8">
          No credit card required. Access instant sponsor matching.
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
