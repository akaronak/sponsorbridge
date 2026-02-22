import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface FloatingCardProps {
  title: string;
  description: string;
  icon: string;
  delay: number;
  mouseX: number;
  mouseY: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  title,
  description,
  icon,
  delay,
  mouseX,
  mouseY,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Entrance animation
  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: delay,
        ease: 'power3.out',
      }
    );
  }, [delay]);

  // Floating animation - subtle bob effect
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(cardRef.current, {
        y: 20,
        duration: 3 + delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => ctx.revert();
  }, [delay]);

  // Mouse movement tilt effect
  useEffect(() => {
    if (!cardRef.current) return;

    // Apply tilt based on mouse position
    const rotateX = (mouseY / 5) * (isHovered ? 1 : 0.5);
    const rotateY = (mouseX / 5) * (isHovered ? 1 : 0.5);

    gsap.to(cardRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.5,
      overwrite: 'auto',
      transformPerspective: 1200,
    });
  }, [mouseX, mouseY, isHovered]);

  // Glare effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glareRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(glareRef.current, {
      left: x,
      top: y,
      duration: 0.3,
      overwrite: 'auto',
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset tilt on mouse leave
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: 'power3.out',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group w-64 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:shadow-indigo-500/20 transition-shadow duration-300 cursor-pointer relative overflow-hidden"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
    >
      {/* Glare effect */}
      <div
        ref={glareRef}
        className="absolute -top-1/2 -left-1/2 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateZ(100px)',
        }}
      />

      {/* Glow border effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.5), transparent 70%)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Content */}
      <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
        {/* Icon */}
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-indigo-300 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
          {description}
        </p>

        {/* Hover indicator line */}
        <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:w-12 transition-all duration-300" />
      </div>
    </div>
  );
};

export default FloatingCard;
