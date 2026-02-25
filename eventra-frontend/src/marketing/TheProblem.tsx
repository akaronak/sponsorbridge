import React from 'react';
import { Mail, EyeOff, Layers, BarChart3 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const painPoints = [
  {
    icon: Mail,
    title: 'Manual Outreach',
    stat: '< 3%',
    statLabel: 'cold email response rate',
    description:
      'Hundreds of cold emails sitting in spam folders. No personalization at scale. No way to know who is actually interested.',
  },
  {
    icon: EyeOff,
    title: 'Zero Transparency',
    stat: '0',
    statLabel: 'pricing standards',
    description:
      'Hidden pricing structures. Opaque negotiation processes. No industry benchmarks. Every deal starts from scratch.',
  },
  {
    icon: Layers,
    title: 'Fragmented Workflows',
    stat: '6+',
    statLabel: 'tools per deal',
    description:
      'Spreadsheets, email threads, phone calls, PDFs, shared drives. No single source of truth. Deals fall through the cracks.',
  },
  {
    icon: BarChart3,
    title: 'No Measurement',
    stat: '72%',
    statLabel: 'can\'t prove ROI',
    description:
      'No attribution models. No performance tracking. No data to inform future sponsorship decisions or justify spend.',
  },
];

const TheProblem: React.FC = () => {
  return (
    <section className="relative py-32 px-6 bg-[#0b1120] overflow-hidden">
      {/* ── Layer 0: Deep base fill ── */}
      <div className="absolute inset-0 bg-[#0b1120]" />

      {/* ── Layer 1: Background image (golden concert silhouette) ── */}
      <img
        src="/hero-problem.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* ── Layer 2: Primary dark gradient overlay (75-85% coverage) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/85 via-[#0b1120]/70 to-[#0b1120]/85 pointer-events-none" />

      {/* ── Layer 3: Brand tint overlay (subtle warm-to-cool atmosphere) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/25 via-transparent to-rose-950/15 pointer-events-none" />

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

      {/* ── Edge blending: seamless transitions ── */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#0b1120] via-[#0b1120]/80 to-transparent pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/80 to-transparent pointer-events-none z-[1]" />

      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-red-500/[0.02] blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium text-rose-400/80 tracking-widest uppercase mb-4">
            The Problem
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Sponsorship deals are
            <span className="text-slate-500"> broken.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            The sponsorship industry runs on outdated practices — manual outreach,
            hidden information, and zero infrastructure for tracking or measurement.
          </p>
        </ScrollReveal>

        {/* Pain Point Cards — 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {painPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="group relative p-8 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-500 h-full">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-rose-500/[0.06] border border-rose-500/[0.1] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-rose-400/80" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {point.title}
                        </h3>
                      </div>

                      {/* Stat callout */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-rose-400/70 tabular-nums">
                          {point.stat}
                        </span>
                        <span className="text-sm text-slate-500">
                          {point.statLabel}
                        </span>
                      </div>

                      <p className="text-slate-400 text-[15px] leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TheProblem;
