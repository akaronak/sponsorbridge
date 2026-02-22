import React, { useRef, useEffect, useState, memo } from 'react';
import gsap from 'gsap';

interface TimelineStepProps {
  number: string;
  title: string;
  description: string;
  icon: any;  // Lucide icon component
  color: string;
  isActive?: boolean;
  isDesktop?: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = memo(({
  number,
  title,
  description,
  icon: Icon,
  color,
  isActive = false,
  isDesktop = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if this step is completed via data attribute
    const parent = cardRef.current?.parentElement;
    if (parent?.getAttribute('data-completed') === 'true') {
      setIsCompleted(true);
    }
  }, []);

  const handleMouseEnter = () => {
    if (!isDesktop || !cardRef.current) return;

    setIsHovered(true);

    // Lift card - ONLY transform, no shadow changes
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.03,
      duration: 0.25,
      ease: 'power3.out',
    });

    // Rotate to flat
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.3,
      ease: 'power3.out',
    });
  };

  const handleMouseLeave = () => {
    if (!isDesktop || !cardRef.current) return;

    setIsHovered(false);

    // Reset position
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'power3.out',
    });

    // Return to tilted position
    gsap.to(cardRef.current, {
      rotationX: -2,
      rotationY: 0,
      duration: 0.35,
      ease: 'power3.out',
    });
  };

  // Determine styling based on state
  const getStepOpacity = () => {
    if (isActive || isCompleted) return 'opacity-100';
    return 'opacity-75';
  };

  const getIconColor = () => {
    if (isActive) return `bg-gradient-to-br ${color}`;
    if (isCompleted) return 'bg-gradient-to-br from-emerald-500 to-teal-500';
    return `bg-gradient-to-br ${color} opacity-60`;
  };

  const getContentBg = () => {
    if (isActive) return 'bg-white/8 border-indigo-500/30';
    if (isCompleted) return 'bg-white/6 border-emerald-500/20';
    return 'bg-white/4 border-white/10';
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative h-full"
      style={{
        perspective: '1400px',
        transformStyle: 'preserve-3d',
        transform: isDesktop ? 'rotateX(-2deg)' : 'none',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* Glow backdrop - Subtle, minimal blur */}
      <div
        ref={glowRef}
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-10 pointer-events-none`}
        style={{
          zIndex: -1,
          filter: 'blur(12px)',
        }}
      />

      {/* Main card content */}
      <div
        ref={contentRef}
        className={`relative h-full min-h-[380px] flex flex-col rounded-2xl ${getContentBg()} backdrop-blur-md border transition-all duration-300 overflow-hidden ${getStepOpacity()}`}
        style={{
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Noise texture overlay - minimal octaves */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' result=\'noise\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' fill=\'%23ffffff\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
          }}
        />

        {/* Content container */}
        <div className="relative h-full flex flex-col p-6 md:p-8">
          {/* Step number badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs md:text-sm font-mono font-semibold text-indigo-300 tracking-widest">
              STEP {number}
            </span>
            {isCompleted && (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Icon - Static size, no hover scale */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${getIconColor()} mb-4`}
          >
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>

          {/* Title - Fixed spacing, prevents layout shift */}
          <h3
            className={`text-lg md:text-xl font-semibold mb-4 leading-tight ${
              isHovered ? 'text-transparent bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text' : 'text-white'
            } transition-colors duration-300`}
            style={{
              minHeight: '3rem',
            }}
          >
            {title}
          </h3>

          {/* Description */}
          <p className={`text-sm md:text-base ${isActive ? 'text-slate-200' : 'text-slate-300'} transition-colors duration-300 flex-grow`}>
            {description}
          </p>

          {/* Accent line removed - improved performance */}

          {/* Optional: Mini UI preview on hover (desktop only) */}
          {isHovered && isDesktop && <MiniPreview stepNumber={parseInt(number)} />}
        </div>

        {/* Active indicator dot */}
        <div
          className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-all duration-300 ${
            isActive ? 'bg-indigo-400 scale-150' : isCompleted ? 'bg-emerald-400' : 'bg-slate-600 scale-75'
          }`}
        />
      </div>
    </div>
  );
});

TimelineStep.displayName = 'TimelineStep';

// Mini preview component (subtle, performance-friendly)
const MiniPreview: React.FC<{ stepNumber: number }> = ({ stepNumber }) => {
  const previewData = {
    1: {
      title: 'Event Details',
      stats: ['Budget: $50K', 'Audience: 5K+', 'Category: Tech'],
    },
    2: {
      title: 'Top Matches',
      stats: ['92% match', '87% match', '84% match'],
    },
    3: {
      title: 'Live Chat',
      stats: ['2 active', 'Avg 4min', '98% satisfied'],
    },
    4: {
      title: 'Deal Metrics',
      stats: ['ROI: +240%', 'Time: 4 days', 'Closed'],
    },
  };

  const data = previewData[stepNumber as keyof typeof previewData] || previewData[1];

  return (
    <div
      className="mt-6 pt-6 border-t border-white/10 animate-fadeIn"
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div className="text-xs font-semibold text-indigo-300 mb-3 opacity-80">{data.title}</div>
      <div className="space-y-2">
        {data.stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center text-xs text-slate-300"
            style={{
              animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
            {stat}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateX(-8px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TimelineStep;
