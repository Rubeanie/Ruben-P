'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas as R3FCanvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';
import CanvasLoader from './CanvasLoader';

export default function Canvas({
  children,
  className,
  style,
  loader = true,
  ...props
}) {
  const containerRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [dpr, setDpr] = useState(0.9);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ pointerEvents: 'none', ...style }}>
      <R3FCanvas
        shadows
        gl={{ precision: 'lowp', powerPreference: 'high-performance' }}
        dpr={dpr}
        frameloop={onScreen ? 'always' : 'never'}
        {...props}>
        {children}
        <Preload all />
        <PerformanceMonitor
          ms={200}
          iterations={7}
          step={0.05}
          factor={1}
          onChange={({ factor }) =>
            setDpr(Math.round((0.5 + 0.6 * factor) * 100) / 100)
          }
        />
      </R3FCanvas>
      {loader && <CanvasLoader />}
    </div>
  );
}
