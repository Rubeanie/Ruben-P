'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Loading } from '@/components/dom/Loading';
import styles from '@/styles/components/ThreeScene.module.scss';

// Single dynamic boundary for the whole 3D scene, so R3F/three stay out of the
// page bundle. Scene statically composes Canvas + Model + Environment so they
// suspend into Canvas's own Suspense — the loader stays up through the real asset
// load, not just the JS-chunk load.
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false,
  loading: () => (
    <div className={`${styles.canvas} ${styles.canvasLoading}`}>
      <Loading />
    </div>
  )
});

// Defer the scene — chunk, GLB, HDRI/PMREM, GPU uploads — until it nears the
// viewport, so off-screen scenes don't all load at once and jank scrolling. The
// section reserves the box, so mounting late causes no layout shift.
export default function SceneCanvas(props) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

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
    <div ref={ref} className={styles.canvas}>
      {active && <Scene {...props} />}
    </div>
  );
}
