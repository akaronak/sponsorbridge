import React, { useEffect, useRef, useState } from 'react';
import { Search, Zap, MessageSquare, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Smart Sponsor Discovery',
    description: 'Filter and find sponsors aligned with your event category and audience.'
  },
  {
    icon: Zap,
    title: 'Intelligent Matching Engine',
    description: 'AI-powered compatibility scoring to connect the right brands instantly.'
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Communication',
    description: 'Seamless sponsor-organizer messaging built for fast decisions.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track outreach performance, response time, and sponsorship ROI.'
  }
];

const Features: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }, index * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 sm:px-12 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for Real Results
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to connect with sponsors and close deals faster.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`p-8 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 hover:shadow-lg cursor-pointer group ${
                  visibleCards[index]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionProperty: 'opacity, transform, box-shadow, border-color',
                  transitionDuration: visibleCards[index] ? '200ms' : '600ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: visibleCards[index] ? 'translateY(0)' : 'translateY(32px)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-start gap-4">
                  <Icon className="w-8 h-8 text-indigo-400 flex-shrink-0 mt-1 transition-transform duration-200 group-hover:scale-110" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-200 group-hover:text-indigo-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed transition-colors duration-200 group-hover:text-slate-300">
                      {feature.description}
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

export default Features;
