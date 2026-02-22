import React, { useEffect, useRef, useState } from 'react';

interface Counter {
  label: string;
  value: number;
  suffix: string;
}

const counters: Counter[] = [
  { label: 'Events Registered', value: 120, suffix: '+' },
  { label: 'Sponsorship Facilitated', value: 32, suffix: 'L₹' },
  { label: 'Companies Onboarded', value: 45, suffix: '+' }
];

const AnimatedCounter: React.FC<{ value: number; suffix: string; isVisible: boolean }> = ({ value, suffix, isVisible }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;

    const duration = 2500; // Smooth, deliberate timing
    const frames = 60;
    const frameInterval = duration / frames;
    let currentFrame = 0;

    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t); // Smooth easing (not flashy)

    const animate = () => {
      currentFrame++;
      const progress = easeOutQuad(currentFrame / frames);
      const currentValue = Math.floor(value * progress);

      setCount(currentValue);

      if (currentFrame < frames) {
        setTimeout(animate, frameInterval);
      } else {
        setCount(value);
        hasAnimated.current = true;
      }
    };

    animate();
  }, [isVisible, value]);

  return (
    <div className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
      {count}<span className="text-indigo-400 ml-1">{suffix}</span>
    </div>
  );
};

const SocialProof: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6 sm:px-12 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Glass Panel Container */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-12 sm:p-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {counters.map((item, index) => (
              <div key={index} className="text-center relative">
                {/* Divider - Hidden on first item */}
                {index > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-slate-700/50 to-transparent hidden md:block"></div>
                )}

                {/* Content */}
                <div className="flex flex-col items-center">
                  {isVisible && (
                    <>
                      <AnimatedCounter value={item.value} suffix={item.suffix} isVisible={isVisible} />
                      <p className="text-slate-300 mt-4 text-base font-medium tracking-wide">
                        {item.label}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle supporting text */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Trusted by event organizers and sponsors building the future of sponsorship
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
