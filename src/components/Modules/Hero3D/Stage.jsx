'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import { preload } from 'react-dom';
import dynamic from 'next/dynamic';
import { MODEL } from '@/lib/hero3d';
import { whenIdle } from '@/lib/youtube';
import createBeats from './beats';
import createProgress, { RANGE } from './progress';
import styles from '@/styles/components/Hero3D.module.scss';

// Fetched once the page has loaded, so three.js never competes with the first
// paint or holds up a phone's first taps; the layer fades in when it is ready.
// A link to this page warms the code ahead of a client navigation.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

const subscribe = (change) => {
  addEventListener('scroll', change, { passive: true });
  addEventListener('resize', change);
  return () => {
    removeEventListener('scroll', change);
    removeEventListener('resize', change);
  };
};

// A fixed, full-bleed layer behind the page for the whole move: the content
// after it scrolls up over the canvas, and once the move has run out the layer
// hides and stops drawing, until the page scrolls back up into it.
export default function Stage({ grain }) {
  const [load, setLoad] = useState(false);
  // The model downloads alongside three.js, not after it.
  useEffect(
    () =>
      whenIdle(() => {
        preload(MODEL, { as: 'fetch', crossOrigin: 'anonymous' });
        setLoad(true);
      }),
    []
  );
  const ref = useRef(null);
  const vignette = useRef(null);
  const done = useSyncExternalStore(
    subscribe,
    () => scrollY > RANGE * (ref.current?.clientHeight ?? innerHeight),
    () => false
  );
  // The move's progress, shared by the rig and the text beats; it runs on its
  // own loop, so the beats settle even once the canvas has stopped.
  const progress = useRef(null);
  useEffect(() => {
    const move = (progress.current = createProgress(ref.current));
    const beats = createBeats(move, ref.current.closest('section'));
    return () => {
      beats();
      move.stop();
      progress.current = null;
    };
  }, []);
  const onReady = useCallback(() => {
    if (ref.current) ref.current.dataset.ready = 'true';
  }, []);

  return (
    <div
      ref={ref}
      className={styles.stage}
      data-done={done || undefined}
      aria-hidden='true'>
      {load && (
        <Scene
          frameloop={done ? 'never' : 'always'}
          progress={progress}
          vignette={vignette}
          stage={ref}
          grain={grain}
          onReady={onReady}
        />
      )}
      <div ref={vignette} className={styles.vignette} />
    </div>
  );
}
