import React from 'react';
import { Target, Users, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const pillars = [
  {
    icon: Target,
    title: 'For Event Organizers',
    description:
      'Find sponsors who genuinely align with your audience, values, and event vision — not just whoever replies first.',
  },
  {
    icon: Users,
    title: 'For Sponsors & Brands',
    description:
      'Discover high-impact events that match your target market. Skip the cold outreach. Invest where it counts.',
  },
  {
    icon: Globe,
    title: 'Built for the Sponsorship Economy',
    description:
      'An enterprise-grade platform replacing fragmented workflows with a single, intelligent system built for scale.',
  },
];

const WhatWeAre: React.FC = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* ── Layer 0: Deep base fill ── */}
      <div className="absolute inset-0 bg-[#0b1120]" />

      {/* ── Layer 1: Background image (full quality, no opacity reduction) ── */}
      <img
        src="/hero-crowd.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* ── Layer 2: Primary dark gradient overlay (70-80% coverage) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/80 via-[#0b1120]/70 to-[#0b1120]/85 pointer-events-none" />

      {/* ── Layer 3: Brand tint overlay (subtle blue-purple atmosphere) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-blue-950/20 pointer-events-none" />

      {/* ── Layer 4: Noise texture for film grain depth ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── Soft vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, #0b1120 100%)',
        }}
      />

      {/* ── Edge blending: seamless transition into adjacent sections ── */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#0b1120] via-[#0b1120]/80 to-transparent pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/90 to-transparent pointer-events-none z-[1]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-4">
            What We Are
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            The platform that sponsorship
            <br className="hidden sm:block" />
            has been waiting for.
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            Eventra is an intelligent marketplace where event organizers and
            sponsors connect, negotiate, and grow — transparently and efficiently.
          </p>
        </ScrollReveal>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500">
                  {/* Icon */}
                  <div className="w-12 h-12 mb-6 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/[0.12] flex items-center justify-center group-hover:bg-indigo-500/[0.12] transition-colors duration-500">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-[15px]">
                    {pillar.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatWeAre;
