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
import { Loading } from '@/components/dom/Loading';
import { MODEL } from '@/lib/hero3d';
import { whenIdle } from '@/lib/youtube';
import createBeats from './beats';
import createProgress, { RANGE } from './progress';
import styles from '@/styles/components/Hero3D.module.scss';

// Fetched once the page has loaded, so three.js never competes with the first
// paint or holds up a phone's first taps; the layer fades in when it is ready.
// A link to this page warms the code ahead of a client navigation.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

// A load still running this long after it started is a slow line, and the
// loader stands in where the mark will appear. Measured on alpha the scene is
// ready about 0.7 s after it starts on broadband and 1.3 s on Fast 4G, so fast
// connections never see it.
const SLOW = 1500;
// Past this it is a hang, not a slow line: the loader bows out and the hero
// stays a photo. A 3D scene module gives up after the same 20 s.
const GIVE_UP = 20000;
// The loader's fade (Hero3D.module.scss), then it unmounts.
const FADE = 800;
// The scroll hint's threshold: past it the move has begun, and the loader only
// stands in for the mark at rest.
const TOP = 40;

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
  const top = useSyncExternalStore(
    subscribe,
    () => scrollY <= TOP,
    () => true
  );
  // null, 'on' once the load runs slow, 'out' while it fades away.
  const [loader, setLoader] = useState(null);
  useEffect(() => {
    if (!load) return undefined;
    const slow = setTimeout(() => {
      const { ready, failed } = ref.current?.dataset ?? {};
      if (!ready && !failed) setLoader('on');
    }, SLOW);
    const giveUp = setTimeout(
      () => setLoader((state) => state && 'out'),
      GIVE_UP
    );
    return () => {
      clearTimeout(slow);
      clearTimeout(giveUp);
    };
  }, [load]);
  useEffect(() => {
    if (loader !== 'out') return undefined;
    const gone = setTimeout(() => setLoader(null), FADE);
    return () => clearTimeout(gone);
  }, [loader]);
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
  // The loader crossfades into the scene's own fade-in.
  const onReady = useCallback(() => {
    if (ref.current) ref.current.dataset.ready = 'true';
    setLoader((state) => state && 'out');
  }, []);
  // A scene that threw: the loader bows out and the hero stays a photo. The
  // mark keeps a loader that has not shown yet from showing later.
  const onError = useCallback(() => {
    if (ref.current) ref.current.dataset.failed = 'true';
    setLoader((state) => state && 'out');
  }, []);

  return (
    <>
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
            onError={onError}
          />
        )}
        <div ref={vignette} className={styles.vignette} />
      </div>
      {loader && (
        <div
          className={styles.loading}
          data-out={loader === 'out' || !top || undefined}>
          <Loading />
        </div>
      )}
    </>
  );
}
