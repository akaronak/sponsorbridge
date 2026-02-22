import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import FloatingCard from './FloatingCard';

const PremiumHero: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const gradient1Ref = useRef<HTMLDivElement>(null);
  const gradient2Ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Card data with positioning
  const cards = [
    {
      id: 1,
      title: 'Smart Matching',
      description: 'AI-powered algorithm connects events with perfect sponsors',
      icon: '🎯',
      position: { top: '10%', left: '5%' },
      delay: 0.2,
    },
    {
      id: 2,
      title: 'Real-time Analytics',
      description: 'Track ROI and sponsorship performance instantly',
      icon: '📊',
      position: { top: '50%', right: '8%' },
      delay: 0.3,
    },
    {
      id: 3,
      title: 'Secure Payments',
      description: 'Enterprise-grade encryption for all transactions',
      icon: '🔒',
      position: { bottom: '15%', left: '8%' },
      delay: 0.4,
    },
  ];

  // Headline text split for staggered animation
  const headlineText = "Where College Events Meet Serious Sponsors";
  const headlineWords = headlineText.split(' ');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered headline animation
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word-reveal');
        gsap.fromTo(
          words,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }

      // Subtext fade-in with slight upward motion
      gsap.fromTo(
        subtextRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.4,
          ease: 'power3.out',
        }
      );

      // CTA buttons entrance
      gsap.fromTo(
        ctaContainerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.6,
          ease: 'power3.out',
        }
      );

      // Gradient animation - slow infinite loop
      gsap.to(gradient1Ref.current, {
        x: 100,
        y: 50,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(gradient2Ref.current, {
        x: -100,
        y: -50,
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Mouse movement parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setMousePos({ x: x * 20, y: y * 20 });

      // Move gradient blobs slightly based on mouse
      gsap.to(gradient1Ref.current, {
        x: 100 + x * 10,
        y: 50 + y * 10,
        duration: 0.8,
        overwrite: 'auto',
      });

      gsap.to(gradient2Ref.current, {
        x: -100 + x * 10,
        y: -50 + y * 10,
        duration: 0.8,
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll parallax
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;

      // Cards move up as user scrolls
      const cards = containerRef.current.querySelectorAll('[data-floating-card]');
      cards.forEach((card) => {
        gsap.to(card, {
          y: scrollY * 0.3,
          duration: 0.5,
          overwrite: 'auto',
        });
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle button clicks
  const handleGetStarted = () => navigate('/register');
  const handleExploreSponsor = () => navigate('/login');

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
    >
      {/* Animated Gradient Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Blob 1 */}
        <div
          ref={gradient1Ref}
          className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl opacity-40"
          style={{ filter: 'blur(100px)' }}
        />

        {/* Gradient Blob 2 */}
        <div
          ref={gradient2Ref}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-30"
          style={{ filter: 'blur(100px)' }}
        />

        {/* Subtle Grid Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 76%, transparent 77%)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Cards */}
      <div className="absolute inset-0 pointer-events-none">
        {cards.map((card) => (
          <div
            key={card.id}
            data-floating-card
            className="absolute pointer-events-auto"
            style={{
              top: card.position.top,
              left: card.position.left,
              right: card.position.right,
              bottom: card.position.bottom,
            }}
          >
            <FloatingCard
              title={card.title}
              description={card.description}
              icon={card.icon}
              delay={card.delay}
              mouseX={mousePos.x}
              mouseY={mousePos.y}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 sm:px-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            {headlineWords.map((word, idx) => (
              <span key={idx} className="word-reveal">
                {word}
                {idx < headlineWords.length - 1 && <> </>}
              </span>
            ))}
          </h1>

          {/* Gradient text effect on headline */}
          <style>{`
            h1 .word-reveal {
              background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
          `}</style>

          {/* Subtext */}
          <p
            ref={subtextRef}
            className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A smarter way for student communities to connect with brands that actually fund.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaContainerRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 active:scale-97 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            <button
              onClick={handleExploreSponsor}
              className="group px-8 py-3 sm:py-4 border-2 border-slate-700 text-white font-semibold rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 active:scale-97"
            >
              <span className="flex items-center gap-2">
                Explore Sponsors
              </span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-12 border-t border-slate-800/50">
            <p className="text-sm text-slate-400 mb-4">Trusted by 120+ college events</p>
            <div className="flex justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$2M+</div>
                <div className="text-xs text-slate-400">Sponsored</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-slate-400">Event Organizers</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-xs text-slate-400">Brand Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default PremiumHero;
