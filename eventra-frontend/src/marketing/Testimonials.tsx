import React from 'react';
import { Quote } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const testimonials = [
  {
    quote:
      'Eventra transformed how we approach event sponsorship. What used to take weeks of cold outreach now takes days with qualified matches.',
    name: 'Sarah Chen',
    title: 'VP of Events',
    company: 'TechConnect',
  },
  {
    quote:
      'The matching quality is exceptional. Every sponsor recommendation felt specifically curated for our audience and event format.',
    name: 'Marcus Johnson',
    title: 'Director of Partnerships',
    company: 'Campus Summit',
  },
  {
    quote:
      'Finally, a platform that treats sponsorship as a data problem, not a networking problem. The transparency is refreshing.',
    name: 'Elena Rodriguez',
    title: 'CMO',
    company: 'Brandwise Agency',
  },
];

const logos = [
  'TechConnect',
  'Campus Summit',
  'Brandwise',
  'EventForge',
  'SponsorLab',
  'MediaBridge',
];

const Testimonials: React.FC = () => {
  return (
    <section className="relative py-32 px-6 bg-[#0b1120] overflow-hidden">
      {/* Layer 0 – deep base fill */}
      <div className="absolute inset-0 bg-[#0b1120] z-[0]" />

      {/* Layer 1 – background image, full quality */}
      <img
        src="/stadium-image.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />

      {/* Layer 2 – dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/85 via-[#0b1120]/75 to-[#0b1120]/85 z-[2]" />

      {/* Layer 3 – cool brand tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-violet-950/20 z-[3]" />

      {/* Layer 4 – noise texture */}
      <svg className="absolute inset-0 w-full h-full z-[4] opacity-[0.03] mix-blend-overlay pointer-events-none">
        <filter id="testimonialNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#testimonialNoise)" />
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
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/80 to-transparent z-[6] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-4">
            Social Proof
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Trusted by industry leaders.
          </h2>
        </ScrollReveal>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] h-full flex flex-col">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-indigo-500/20 mb-5 flex-shrink-0" />

                {/* Quote text */}
                <p className="text-slate-300 text-[15px] leading-relaxed flex-1 mb-6">
                  "{t.quote}"
                </p>

                {/* Attribution */}
                <div className="border-t border-white/[0.04] pt-5">
                  <p className="text-sm font-semibold text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Company Logos */}
        <ScrollReveal>
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
              {logos.map((logo, i) => (
                <span
                  key={i}
                  className="text-lg font-semibold text-slate-600/60 hover:text-slate-500 transition-colors duration-300 select-none"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Testimonials;
