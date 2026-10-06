'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas as R3FCanvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';

const STEP = 0.05;

// A 1x screen gains nothing from rendering denser than its own pixels.
const fit = (dpr) =>
  typeof window === 'undefined' ? dpr : Math.min(window.devicePixelRatio, dpr);

// Sentinel rendered inside the Suspense boundary: it only mounts once every
// suspending child in this boundary has resolved, so it signals "this canvas is
// loaded" — per instance, with no reliance on three's global loading manager
// (which would be shared across multiple canvases). Children with their own
// inner Suspense (e.g. the environment) load independently and don't gate it.
function Ready({ onReady }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

export default function Canvas({
  children,
  className,
  style,
  onReady,
  onOverload,
  frameloop,
  dprRange = [0.5, 1.1],
  ...props
}) {
  const containerRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [factor, setFactor] = useState(1);
  const [min, max] = dprRange;
  const dpr = fit(Math.round((min + (max - min) * factor) * 100) / 100);
  // Only watch frames while the loop runs continuously.
  const loop = frameloop ?? (onScreen ? 'always' : 'never');
  // At the 0.5 floor, tracked from the declines themselves: the monitor's
  // onChange stops firing once the factor reaches 0.
  const floor = useRef(false);

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
        gl={{ precision: 'lowp', powerPreference: 'high-performance' }}
        dpr={dpr}
        frameloop={loop}
        {...props}>
        <Suspense fallback={null}>
          {children}
          <Ready onReady={onReady} />
        </Suspense>
        <Preload all />
        {loop === 'always' && (
          <PerformanceMonitor
            ms={200}
            iterations={7}
            step={STEP}
            // Only read on mount: a remount resumes from what it learned.
            factor={factor}
            onChange={({ factor }) => setFactor(factor)}
            onIncline={() => (floor.current = false)}
            onDecline={({ factor }) => {
              if (floor.current) onOverload?.();
              floor.current = factor < STEP / 2;
              if (floor.current) setFactor(0);
            }}
          />
        )}
      </R3FCanvas>
    </div>
  );
}
