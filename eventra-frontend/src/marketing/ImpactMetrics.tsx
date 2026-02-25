import React, { useEffect, useRef, useState } from 'react';
import AnimatedCounter from './AnimatedCounter';
import ScrollReveal from './ScrollReveal';

const metrics = [
  {
    value: 120,
    suffix: '+',
    label: 'Events Onboarded',
    description: 'Active events using the platform',
  },
  {
    prefix: '$',
    value: 2,
    suffix: 'M+',
    label: 'Sponsorship Facilitated',
    description: 'Total value of deals processed',
  },
  {
    value: 200,
    suffix: '+',
    label: 'Active Partnerships',
    description: 'Ongoing sponsor-event relationships',
  },
  {
    value: 14,
    suffix: '',
    label: 'Day Avg. Deal Closure',
    description: 'From first match to signed deal',
  },
];

const ImpactMetrics: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-32 px-6 bg-[#0b1120] overflow-hidden" ref={sectionRef}>
      {/* Layer 0 – deep base fill */}
      <div className="absolute inset-0 bg-[#0b1120] z-[0]" />

      {/* Layer 1 – background image, full quality */}
      <img
        src="/concert (1).jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />

      {/* Layer 2 – dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/85 via-[#0b1120]/75 to-[#0b1120]/90 z-[2]" />

      {/* Layer 3 – brand tint (warm-to-cool to complement the red image) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-rose-950/20 z-[3]" />

      {/* Layer 4 – noise texture */}
      <svg className="absolute inset-0 w-full h-full z-[4] opacity-[0.03] mix-blend-overlay pointer-events-none">
        <filter id="impactNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#impactNoise)" />
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

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-indigo-400 tracking-widest uppercase mb-4">
            Our Impact
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Built with measurable results.
          </h2>
        </ScrollReveal>

        {/* Metrics Grid */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-10 sm:p-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="relative text-center group"
                >
                  {/* Divider on lg — skip first */}
                  {i > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-14 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent hidden lg:block" />
                  )}

                  {/* Counter */}
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                    <AnimatedCounter
                      value={m.value}
                      prefix={m.prefix || ''}
                      suffix={m.suffix}
                      isVisible={isVisible}
                    />
                  </div>

                  {/* Label */}
                  <p className="text-sm font-medium text-slate-300 mb-1">
                    {m.label}
                  </p>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div> {/* end relative z-10 */}
    </section>
  );
};

export default ImpactMetrics;
