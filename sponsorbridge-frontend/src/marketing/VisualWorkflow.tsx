import React from 'react';
import { FileText, Zap, TrendingUp } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Create Your Event',
    description:
      'Set up your event profile, define your audience demographics, and specify your sponsorship tiers and deliverables.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Intelligent Matching',
    description:
      'Our algorithm analyzes thousands of data points to connect you with sponsors who align with your audience and goals.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Negotiate & Track',
    description:
      'Manage proposals, negotiate terms, and track deal progress from first contact to signed agreement — all in one place.',
  },
];

const VisualWorkflow: React.FC = () => {
  return (
    <section className="relative py-32 px-6 bg-[#0b1120] overflow-hidden">
      {/* Layer 0 – deep base fill */}
      <div className="absolute inset-0 bg-[#0b1120] z-[0]" />

      {/* Layer 1 – background image, full quality */}
      <img
        src="/download (7).jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />

      {/* Layer 2 – dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/85 via-[#0b1120]/75 to-[#0b1120]/85 z-[2]" />

      {/* Layer 3 – brand tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-blue-950/20 z-[3]" />

      {/* Layer 4 – noise texture */}
      <svg className="absolute inset-0 w-full h-full z-[4] opacity-[0.03] mix-blend-overlay pointer-events-none">
        <filter id="workflowNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#workflowNoise)" />
      </svg>

      {/* Soft vignette */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(11,17,32,0.5) 100%)',
        }}
      />

      {/* Top edge blend */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#0b1120] via-[#0b1120]/70 to-transparent z-[6] pointer-events-none" />

      {/* Bottom edge blend */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/70 to-transparent z-[6] pointer-events-none" />

      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-500/[0.02] blur-[140px] pointer-events-none z-[7]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-4">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Three steps to smarter sponsorship.
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            A streamlined workflow designed for speed, clarity, and results.
          </p>
        </ScrollReveal>

        {/* ── Desktop: Horizontal Timeline ── */}
        <div className="hidden md:block">
          {/* Connecting line */}
          <div className="relative">
            <div className="absolute top-[52px] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/40 to-indigo-500/20" />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="flex flex-col items-center text-center">
                    {/* Step circle */}
                    <div className="relative mb-8">
                      <div className="w-[104px] h-[104px] rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/[0.1] to-blue-500/[0.05] border border-indigo-500/[0.15] flex items-center justify-center">
                          <Icon className="w-7 h-7 text-indigo-400" />
                        </div>
                      </div>

                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-950 border border-indigo-500/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-400">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Glass card */}
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] w-full">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 text-[15px] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* ── Mobile: Vertical Flow ── */}
        <div className="md:hidden space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="flex gap-5">
                  {/* Left: Number + connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/[0.12] to-blue-500/[0.06] border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 mt-3 bg-gradient-to-b from-indigo-500/20 to-transparent" />
                    )}
                  </div>

                  {/* Right: Content */}
                  <div className="pb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-400/60">
                        {step.number}
                      </span>
                      <h3 className="text-lg font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-[15px] leading-relaxed">
                      {step.description}
                    </p>
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

export default VisualWorkflow;
