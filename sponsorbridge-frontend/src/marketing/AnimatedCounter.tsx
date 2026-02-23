import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  isVisible: boolean;
}

/**
 * Smooth animated counter with easeOutQuart easing.
 * Counts from 0 to target value when isVisible becomes true.
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  duration = 2500,
  isVisible,
}) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const totalFrames = 80;
    const frameInterval = duration / totalFrames;
    let frame = 0;

    // EaseOutQuart — fast start, smooth deceleration
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);

    const tick = () => {
      frame++;
      const progress = ease(frame / totalFrames);
      setCount(Math.round(value * progress));

      if (frame < totalFrames) {
        setTimeout(tick, frameInterval);
      } else {
        setCount(value);
      }
    };

    tick();
  }, [isVisible, value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
};

export default AnimatedCounter;
