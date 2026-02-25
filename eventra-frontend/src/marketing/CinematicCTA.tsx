import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const CinematicCTA: React.FC = () => {
  return (
    <section className="relative py-32 sm:py-40 px-6 overflow-hidden">
      {/* Background — unified dark base */}
      <div className="absolute inset-0 bg-[#0b1120]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120] via-[#0b1120]/95 to-[#0b1120]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.04] blur-[140px] pointer-events-none" />

      {/* Top edge blend into previous section */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#0b1120] via-[#0b1120]/90 to-transparent z-[2] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8 tracking-tight">
            Ready to transform your
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              sponsorship strategy?
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed font-light">
            Join the platform where every sponsorship decision is backed by data,
            every match is intentional, and every deal is tracked from start to finish.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] text-white font-medium rounded-xl hover:bg-white/[0.1] hover:border-white/[0.18] transition-all duration-300 text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Register
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-sm text-slate-600 mt-8">
            No credit card required. Start matching with sponsors today.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CinematicCTA;
