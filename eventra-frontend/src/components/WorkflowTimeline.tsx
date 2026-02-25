import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TimelineStep from './TimelineStep';
import { CheckCircle2, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface WorkflowStep {
  id: number;
  number: string;
  title: string;
  description: string;
  icon: any;  // Lucide icon component
  color: string;
}

const WorkflowTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<SVGSVGElement>(null);
  const connectorPathRef = useRef<SVGPathElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeStepRef = useRef<number>(0);

  const steps: WorkflowStep[] = [
    {
      id: 1,
      number: '01',
      title: 'Create Event',
      description: 'Organizer defines budget, audience, category, and goals.',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      id: 2,
      number: '02',
      title: 'Smart Matching',
      description: 'AI-driven compatibility scoring ranks ideal sponsors.',
      icon: Sparkles,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 3,
      number: '03',
      title: 'Real-Time Negotiation',
      description: 'Sponsors and organizers communicate seamlessly.',
      icon: MessageSquare,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      id: 4,
      number: '04',
      title: 'Deal Closure & Analytics',
      description: 'Track ROI, response time, and sponsorship impact.',
      icon: TrendingUp,
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  useEffect(() => {
    if (!containerRef.current || !connectorPathRef.current) return;

    const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Skip connector line animation on mobile (vertical layout doesn't need it)
      if (isMobileScreen) return;

      // Get connector path length for stroke animation
      const pathLength = connectorPathRef.current!.getTotalLength();
      
      // Animate connector line
      gsap.fromTo(
        connectorPathRef.current,
        {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top center',
            end: 'center center',
            scrub: 0.8,
            markers: false,
          },
        }
      );

      // Animate timeline container fade in
      gsap.fromTo(
        timelineRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Animate each step card with stagger
      stepsRef.current.forEach((step, idx) => {
        if (!step) return;

        // Entrance animation
        gsap.fromTo(
          step,
          {
            opacity: 0,
            y: 20,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: idx * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Scroll-triggered activation animation
        gsap.to(step, {
          scrollTrigger: {
            trigger: step,
            start: 'center 60%',
            end: 'center 50%',
            onEnter: () => {
              activeStepRef.current = idx;
              updateActiveStep(idx);
            },
            onEnterBack: () => {
              activeStepRef.current = idx;
              updateActiveStep(idx);
            },
            markers: false,
          },
        });

        // Subtle parallax on scroll - further reduced
        gsap.to(step, {
          y: idx % 2 === 0 ? 4 : -4,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.8,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const updateActiveStep = (stepIndex: number) => {
    // Update all steps' active states
    stepsRef.current.forEach((step, idx) => {
      if (!step) return;

      if (idx === stepIndex) {
        // Activate this step - reduced scale
        gsap.to(step, {
          scale: 1.02,
          duration: 0.3,
          ease: 'power3.out',
        });

        // Update card styling via data attribute
        step.setAttribute('data-active', 'true');
      } else if (idx < stepIndex) {
        // Completed steps (before current)
        step.setAttribute('data-completed', 'true');
        gsap.to(step, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Future steps (after current)
        step.removeAttribute('data-completed');
        step.setAttribute('data-active', 'false');
        gsap.to(step, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <section
      ref={containerRef}
      className="relative w-full py-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
    >
      {/* Background blur elements - reduced intensity */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full pointer-events-none" style={{ filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full pointer-events-none" style={{ filter: 'blur(60px)' }} />

      {/* Section header */}
      <div className="relative max-w-5xl mx-auto mb-32 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          How {import.meta.env.VITE_APP_NAME || 'Eventra'} Powers Every Deal
        </h2>
        <p className="text-lg md:text-xl text-slate-300">
          From event creation to deal closure â€" intelligently managed.
        </p>
      </div>

      {/* Timeline container */}
      <div
        ref={timelineRef}
        className="relative max-w-7xl mx-auto"
      >
        {/* Connector line SVG (Desktop only) */}
        {!isMobile && (
          <svg
            ref={connectorRef}
            className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-visible"
            style={{ height: '230px' }}
            viewBox="0 0 1200 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <path
              ref={connectorPathRef}
              d="M 60 75 L 1200 75"
              stroke="url(#connectorGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Vertical connector line (Mobile only) */}
        {isMobile && (
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-blue-500 to-teal-500 rounded-full" />
        )}

        {/* Steps grid/stack - Unified gap */}
        <div
          className={`grid gap-8 items-stretch ${
            isMobile
              ? 'grid-cols-1 pl-16'
              : 'grid-cols-4'
          } relative z-10`}
        >
          {steps.map((step, idx) => (
            <div
              key={step.id}
              ref={(el) => {
                stepsRef.current[idx] = el;
              }}
              data-active={idx === 0 ? 'true' : 'false'}
              data-completed={false}
              className="min-h-[360px]"
            >
              <TimelineStep
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
                color={step.color}
                isActive={idx === 0}
                isDesktop={!isMobile}
              />
            </div>
          ))}
        </div>

        {/* Mobile vertical progress line animation */}
        {isMobile && (
          <div
            className="absolute left-6 top-0 w-1 bg-gradient-to-b from-indigo-500 via-blue-500 to-teal-500 rounded-full origin-top"
            style={{
              height: '100%',
              transform: 'scaleY(0)',
              transformOrigin: 'top',
            }}
          />
        )}
      </div>

      {/* Bottom CTA section */}
      <div className="relative max-w-3xl mx-auto mt-32 text-center">
        <p className="text-slate-300 mb-8">
          Ready to revolutionize your sponsorship process?
        </p>
        <button className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-103 active:scale-95 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 cursor-pointer">
          Get Started Today
        </button>
      </div>
    </section>
  );
};

export default WorkflowTimeline;
