import { useState, useEffect, useRef } from 'react';

interface UseAnimatedValueOptions {
  duration?: number;
  easing?: 'linear' | 'ease-out' | 'ease-in-out' | 'ease-out-cubic';
}

export const useAnimatedValue = (
  targetValue: number,
  options: UseAnimatedValueOptions = {}
): number => {
  const { duration = 1000, easing = 'ease-out-cubic' } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const animationRef = useRef<number>();

  const easingFunctions = {
    linear: (t: number) => t,
    'ease-out': (t: number) => 1 - Math.pow(1 - t, 2),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    'ease-out-cubic': (t: number) => 1 - Math.pow(1 - t, 3)
  };

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = targetValue;
    const startTime = Date.now();
    const easeFn = easingFunctions[easing];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeFn(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, easing]);

  return displayValue;
};

export default useAnimatedValue;
