'use client';

/**
 * @ai-context Animated number display that counts up/down when value changes.
 * Uses requestAnimationFrame for smooth 60fps counting.
 * @ai-related components/finance/PriceDisplay.tsx
 */
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 600,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const startTime = performance.now();

    if (start === end) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      setDisplayed(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = end;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatted = displayed.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
