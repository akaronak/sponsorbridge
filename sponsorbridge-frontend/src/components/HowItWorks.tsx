import React, { useEffect, useRef, useState } from 'react';
import { FileText, Zap, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Create Event',
    description: 'Set up event details and target audience'
  },
  {
    icon: Zap,
    title: 'Get Matched',
    description: 'AI finds perfect sponsor fits'
  },
  {
    icon: TrendingUp,
    title: 'Close & Track',
    description: 'Secure deals and measure success'
  }
];

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false]);
  const [progressWidth, setProgressWidth] = useState(0);

  // Animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          steps.forEach((_, index) => {
            setTimeout(() => {
              setVisibleSteps(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }, index * 200);
          });
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated progress line based on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const elementTop = containerRef.current.getBoundingClientRect().top;
      const elementHeight = containerRef.current.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;

      // Calculate progress from 0 to 100
      const elementStart = elementTop + window.scrollY;
      const elementEnd = elementStart + elementHeight;
      const scrollPosition = window.scrollY + viewportHeight / 2;

      const progress = Math.max(0, Math.min(100, ((scrollPosition - elementStart) / elementHeight) * 100));
      setProgressWidth(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 sm:px-12 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 text-lg">
            Three simple steps to connect with serious sponsors.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div ref={containerRef} className="hidden md:block relative">
          {/* Background Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-800 z-0"></div>
          
          {/* Animated Progress Line */}
          <div 
            className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 z-5 transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          ></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  {/* Step Indicator Circle */}
                  <div
                    className={`mb-8 transition-all duration-500 ${
                      visibleSteps[index]
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-75'
                    }`}
                  >
                    <div className="relative w-16 h-16">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-500/30"></div>
                      
                      {/* Inner circle */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/30 to-slate-900 border border-indigo-500/50 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-indigo-300" />
                      </div>

                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div
                    className={`text-center transition-all duration-700 ${
                      visibleSteps[index]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm text-balance">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Vertical connector line and step flow */}
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    {/* Step circle */}
                    <div
                      className={`relative w-14 h-14 transition-all duration-500 ${
                        visibleSteps[index]
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-75'
                      }`}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500/30 to-slate-900 border border-indigo-500/50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-indigo-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                    </div>

                    {/* Vertical connector line */}
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-12 mt-2 bg-gradient-to-b from-indigo-500/50 via-indigo-500/30 to-transparent"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`pb-4 pt-2 flex-1 transition-all duration-700 ${
                      visibleSteps[index]
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-4'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
