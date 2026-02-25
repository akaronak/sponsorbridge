import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Word-by-word stagger animation for heading
    if (headingRef.current) {
      const words = headingRef.current.querySelectorAll('span');
      words.forEach((word, index) => {
        word.style.opacity = '0';
        word.style.transform = 'translateY(20px)';
        setTimeout(() => {
          word.animate(
            { opacity: 1, transform: 'translateY(0)' },
            { duration: 600, fill: 'forwards' }
          );
        }, index * 100);
      });
    }

    // Subtext fade-in with upward motion
    if (subtextRef.current) {
      subtextRef.current.style.opacity = '0';
      subtextRef.current.style.transform = 'translateY(20px)';
      setTimeout(() => {
        subtextRef.current?.animate(
          { opacity: 1, transform: 'translateY(0)' },
          { duration: 700, fill: 'forwards' }
        );
      }, 400);
    }

    // CTA slide-up animation
    if (ctaRef.current) {
      ctaRef.current.style.opacity = '0';
      ctaRef.current.style.transform = 'translateY(30px)';
      setTimeout(() => {
        ctaRef.current?.animate(
          { opacity: 1, transform: 'translateY(0)' },
          { duration: 800, fill: 'forwards' }
        );
      }, 600);
    }

    // Subtle gradient animation
    if (bgRef.current) {
      let position = 0;
      const animate = () => {
        position = (position + 0.02) % 100;
        if (bgRef.current) {
          bgRef.current.style.backgroundPosition = `${position}% 50%`;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <section
      ref={bgRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
      style={{ backgroundSize: '200% 200%' }}
    >
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 text-center">
        {/* Hero Heading */}
        <h1
          ref={headingRef}
          className="text-5xl sm:text-7xl font-bold text-white mb-8 leading-tight tracking-tight"
        >
          <span>Where</span> <span>College</span> <span>Events</span> <span>Meet</span>{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Serious Sponsors
          </span>
          .
        </h1>

        {/* Subtext */}
        <p
          ref={subtextRef}
          className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          A smarter way for student communities to connect with brands that actually fund.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={() => navigate('/register')}
            className="group px-8 py-4 bg-white text-slate-950 font-semibold rounded-xl hover:bg-slate-100 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-97"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 border border-slate-600 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-slate-500 transition-all duration-200 active:scale-97"
          >
            Explore Sponsors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
