import React from 'react';
import { Brain, LineChart, Sparkles, Activity } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const roadmapItems = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description:
      'Deep learning models that predict sponsor-event fit with high accuracy, learning from every successful deal on the platform.',
    status: 'In Development',
  },
  {
    icon: LineChart,
    title: 'Predictive Deal Scoring',
    description:
      'Know which deals are most likely to close before negotiations begin. Prioritize outreach based on data, not intuition.',
    status: 'Q3 2026',
  },
  {
    icon: Sparkles,
    title: 'Automated Negotiation',
    description:
      'Smart contract generation, AI-assisted term sheet creation, and automated follow-up workflows to accelerate every deal.',
    status: 'Q4 2026',
  },
  {
    icon: Activity,
    title: 'Global Analytics Engine',
    description:
      'Real-time market intelligence across industries, regions, and event types. Benchmark your sponsorship performance at scale.',
    status: '2027',
  },
];

const FutureRoadmap: React.FC = () => {
  return (
    <section className="relative py-32 px-6 bg-[#0b1120] overflow-hidden">
      {/* Layer 0 – deep base fill */}
      <div className="absolute inset-0 bg-[#0b1120] z-[0]" />

      {/* Layer 1 – background image, full quality, covers entire section */}
      <img
        src="/concert aesthetic.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />

      {/* Layer 2 – dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/80 via-[#0b1120]/70 to-[#0b1120]/85 z-[2]" />

      {/* Layer 3 – warm/vibrant brand tint to complement confetti tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-fuchsia-950/20 z-[3]" />

      {/* Layer 4 – noise texture */}
      <svg className="absolute inset-0 w-full h-full z-[4] opacity-[0.03] mix-blend-overlay pointer-events-none">
        <filter id="roadmapNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#roadmapNoise)" />
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

      {/* Subtle accent */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.02] blur-[140px] pointer-events-none z-[7]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-4">
            Roadmap
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            The road ahead.
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            Building the future of sponsorship intelligence — where every deal is
            data-informed, every match is intentional, and every outcome is measurable.
          </p>
        </ScrollReveal>

        {/* Roadmap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmapItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="group relative p-8 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-indigo-500/[0.12] transition-all duration-500 h-full">
                  {/* Gradient accent on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-lg bg-indigo-500/[0.08] border border-indigo-500/[0.12] flex items-center justify-center group-hover:bg-indigo-500/[0.12] transition-colors duration-500">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>

                      {/* Status badge */}
                      <span className="text-xs font-medium text-slate-500 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.04]">
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-[15px] leading-relaxed">
                      {item.description}
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

export default FutureRoadmap;
