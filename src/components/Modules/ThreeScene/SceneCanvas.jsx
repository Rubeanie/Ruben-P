'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loading } from '@/components/dom/Loading';
import styles from '@/styles/components/ThreeScene.module.scss';

// Single dynamic boundary for the whole 3D scene, so R3F/three stay out of the
// page bundle. Scene statically composes Canvas + Model + Environment so they
// suspend into Canvas's own Suspense: ready means the real assets are in, not
// just the JS chunk. The frame's plate and the loader stand in until then.
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false
});

// Defer the scene (chunk, GLB, HDRI/PMREM, GPU uploads) until it nears the
// viewport, so off-screen scenes don't all load at once and jank scrolling. The
// frame reserves the box, so mounting late causes no layout shift.
export default function SceneCanvas(props) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  // Stable: Canvas's ready sentinel runs an effect keyed on this callback.
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (active) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <>
      <div
        ref={ref}
        className={styles.canvas}
        data-loaded={ready ? '' : undefined}>
        {active && <Scene {...props} onReady={handleReady} />}
      </div>
      {!ready && (
        <div className={styles.loading}>
          <Loading />
        </div>
      )}
    </>
  );
}
