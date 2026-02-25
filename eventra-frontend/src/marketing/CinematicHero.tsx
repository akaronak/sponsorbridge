import React from 'react';

const CinematicHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Layer 0: Deep base fill ── */}
      <div className="absolute inset-0 bg-[#0b1120]" />

      {/* ── Layer 1: Background image (full quality, no opacity reduction) ── */}
      <img
        src="/hero-festival.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center hero-entrance"
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

      {/* ── Animated depth orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.07] blur-[120px] animate-orb-float" />
        <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-blue-500/[0.05] blur-[120px] animate-orb-float-reverse" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-400/[0.03] blur-[160px] animate-pulse-glow" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="hero-entrance mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Now in Public Beta
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-entrance hero-entrance-delay-1 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight leading-[1.08] mb-8">
          <span className="block text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">The Intelligent</span>
          <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(99,102,241,0.3)]">
            Sponsorship Platform
          </span>
        </h1>

        {/* Subtext */}
        <p className="hero-entrance hero-entrance-delay-2 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-14 leading-relaxed font-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
          Connecting events with the right sponsors through data-driven matching,
          intelligent negotiation, and transparent deal flow.
        </p>
      </div>

      {/* ── Bottom gradient fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/80 to-transparent pointer-events-none z-20" />
    </section>
  );
};

export default CinematicHero;
