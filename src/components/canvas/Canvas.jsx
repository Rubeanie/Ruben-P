'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas as R3FCanvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';
import { Loading } from '@/components/dom/Loading';

// Sentinel rendered inside the Suspense boundary: it only mounts once every
// suspending child in this boundary has resolved, so it signals "this canvas is
// loaded" — per instance, with no reliance on three's global loading manager
// (which would be shared across multiple canvases). Children with their own
// inner Suspense (e.g. the environment) load independently and don't gate it.
function Ready({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

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
  const [loaded, setLoaded] = useState(false);
  const handleReady = useCallback(() => setLoaded(true), []);

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
        <Suspense fallback={null}>
          {children}
          <Ready onReady={handleReady} />
        </Suspense>
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
      {loader && !loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
          <Loading />
        </div>
      )}
    </div>
  );
}
