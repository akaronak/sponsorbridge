import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FeatureCard from './FeatureCard';
import {
  Sparkles,
  Brain,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FeaturesShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const glowBlob1Ref = useRef<HTMLDivElement>(null);
  const glowBlob2Ref = useRef<HTMLDivElement>(null);

  const features = [
    {
      id: 1,
      title: 'Smart Sponsor Discovery',
      description:
        'AI-powered algorithm identifies brands that align with your event audience and values.',
      icon: Sparkles,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      id: 2,
      title: 'Intelligent Matching Engine',
      description:
        'Automatically connect events with perfect sponsors based on goals, demographics, and budget.',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 3,
      title: 'Real-Time Communication',
      description:
        'Seamless messaging platform keeps sponsors and organizers aligned throughout the partnership.',
      icon: MessageSquare,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      id: 4,
      title: 'Analytics Dashboard',
      description:
        'Track ROI, engagement metrics, and sponsorship performance with actionable insights.',
      icon: BarChart3,
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Title entrance animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Subtext entrance animation
      gsap.fromTo(
        subtextRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards entrance animation with stagger
      const cards = cardsContainerRef.current?.querySelectorAll('[data-feature-card]');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Parallax scroll animation for glow blobs - reduced intensity
      gsap.to(glowBlob1Ref.current, {
        y: 40,
        opacity: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.5,
          markers: false,
        },
      });

      gsap.to(glowBlob2Ref.current, {
        y: -40,
        opacity: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.6,
          markers: false,
        },
      });

      // Subtle card parallax on scroll - reduced intensity for performance
      cards?.forEach((card, idx) => {
        gsap.to(card, {
          y: (idx % 2) * 6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.8,
            markers: false,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Background Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Blob 1 - Static, minimal repaints */}
        <div
          ref={glowBlob1Ref}
          className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full opacity-40 pointer-events-none"
          style={{ filter: 'blur(80px)', willChange: 'transform' }}
        />

        {/* Glow Blob 2 - Static, minimal repaints */}
        <div
          ref={glowBlob2Ref}
          className="absolute -bottom-32 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full opacity-30 pointer-events-none"
          style={{ filter: 'blur(80px)', willChange: 'transform' }}
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

      {/* Main Content */}
      <div ref={sectionRef} className="relative z-10 px-6 sm:px-12 lg:px-16 py-24 sm:py-32 lg:py-40">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 sm:mb-24">
            <h2
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Built for Smarter
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Sponsorship Deals
              </span>
            </h2>

            <p
              ref={subtextRef}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              SponsorBridge combines discovery, intelligence, and communication into one powerful workflow.
            </p>
          </div>

          {/* Features Grid - Strict alignment constraints */}
          <div
            ref={cardsContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch"
            style={{
              perspective: '1200px',
              transformStyle: 'preserve-3d',
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.id}
                data-feature-card
              >
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                />
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 sm:mt-28 text-center">
            <p className="text-slate-400 text-sm mb-6">
              Ready to revolutionize your sponsorship strategy?
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:scale-103 hover:shadow-2xl hover:shadow-indigo-500/50 active:scale-95 transition-all duration-300 cursor-pointer">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default FeaturesShowcase;
