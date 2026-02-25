import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = memo(({
  title,
  description,
  icon: Icon,
  color,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Apply default 3D rotation on mount
  useEffect(() => {
    if (!cardRef.current) return;

    // Only animate transform properties (GPU-accelerated)
    gsap.set(cardRef.current, {
      rotationX: -1.5,
      rotationY: 1.5,
      transformPerspective: 1200,
      transformStyle: 'preserve-3d',
      willChange: 'transform',
    });
  }, []);

  // Hover animations - only transform, no shadow/blur changes
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      y: -6,
      scale: 1.03,
      duration: 0.25,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotationX: -1.5,
      rotationY: 1.5,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full min-h-[420px]"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
    >
      {/* Card Content - Single backdrop for all content */}
      <div
        className="relative h-full flex flex-col backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 overflow-hidden transition-shadow duration-300 group-hover:border-indigo-500/20 group-hover:bg-white/6 group-hover:shadow-lg"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(0px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Noise texture - very subtle, minimal impact */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' seed=\'1\' /%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1" style={{ transformStyle: 'preserve-3d' }}>
          {/* Icon Container - Fixed size, no scale on hover */}
          <div
            className={`mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${color} p-3`}
            style={{
              transform: 'translateZ(100px)',
            }}
          >
            <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>

          {/* Title - Fixed spacing, prevents layout shift */}
          <h3
            className="text-xl font-semibold text-white mb-4 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-blue-300 group-hover:bg-clip-text transition-all duration-300"
            style={{
              transform: 'translateZ(75px)',
              minHeight: '3rem',
            }}
          >
            {title}
          </h3>

          {/* Description - Flex-grow ensures consistent spacing */}
          <p
            className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300 flex-grow"
            style={{
              transform: 'translateZ(50px)',
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';
export default FeatureCard;
