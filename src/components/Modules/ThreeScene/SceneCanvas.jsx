'use client';

import dynamic from 'next/dynamic';
import Image from '@/components/CdnImage';
import { LuBox, LuRotate3D } from 'react-icons/lu';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loading } from '@/components/dom/Loading';
import { formatBytes } from '@/lib/formatBytes';
import { SCENE_POSTER_SIZES, sizedSizes } from '@/lib/imageBlock';
import styles from '@/styles/components/ThreeScene.module.scss';

// Single dynamic boundary for the whole 3D scene, so R3F/three stay out of the
// page bundle. Scene statically composes Canvas + Model + Environment so they
// suspend into Canvas's own Suspense: ready means the real assets are in, not
// just the JS chunk. The frame's plate and the loader stand in until then.
// One loader for both: an inline import() here would split into a second chunk
// group, and the click would fetch the scene's own code again after the warm-up.
export const warmScene = () => import('@/components/canvas/Scene');
const Scene = dynamic(() => warmScene(), { ssr: false });

// Defer the scene (chunk, GLB, HDRI/PMREM, GPU uploads) until it nears the
// viewport, so off-screen scenes don't all load at once and jank scrolling. The
// frame reserves the box, so mounting late causes no layout shift.
// A model that never resolves (bad host, blocked CORS, huge file) would spin forever.
const LOAD_TIMEOUT = 20000;

export default function SceneCanvas({
  loadOnClick,
  poster,
  modelBytes,
  label,
  blockSize,
  ...props
}) {
  const ref = useRef(null);
  const button = useRef(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [facade, setFacade] = useState(loadOnClick);

  // The facade unmounts under a focused button; the frame takes focus instead
  // so it does not fall back to the page.
  const keepFocus = useCallback(() => {
    if (document.activeElement === button.current) {
      ref.current?.parentElement.focus();
    }
  }, []);

  // Stable: Canvas's ready sentinel runs an effect keyed on this callback.
  const handleReady = useCallback(() => {
    keepFocus();
    setReady(true);
  }, [keepFocus]);

  useEffect(() => {
    if (active || loadOnClick) return undefined;
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
  }, [active, loadOnClick]);

  useEffect(() => {
    if (!active || ready) return undefined;
    const timeout = setTimeout(() => {
      keepFocus();
      setTimedOut(true);
    }, LOAD_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [active, ready, keepFocus]);

  const unmountFacade = (event) => {
    if (event.target === event.currentTarget) setFacade(false);
  };

  const size = formatBytes(modelBytes);
  const Glyph = props.orbitControls ? LuRotate3D : LuBox;

  return (
    <>
      <div
        ref={ref}
        className={styles.canvas}
        data-loaded={ready ? '' : undefined}>
        {active && <Scene {...props} onReady={handleReady} />}
      </div>
      {!ready &&
        (timedOut ? (
          <div className={styles.error}>
            <p>The 3D model could not be loaded.</p>
          </div>
        ) : (
          !loadOnClick && (
            <div className={styles.loading}>
              <Loading />
            </div>
          )
        ))}
      {facade && !timedOut && (
        <div
          className={styles.facade}
          data-loaded={ready || undefined}
          // Out of the tab order while it fades over the live scene.
          inert={ready}
          onTransitionEnd={unmountFacade}
          onTransitionCancel={unmountFacade}>
          {poster && (
            <span className={styles.poster} aria-hidden>
              {/* Blurred, so half the frame's resolution is plenty. */}
              <Image
                src={poster.src}
                alt=''
                fill
                sizes={sizedSizes(SCENE_POSTER_SIZES, blockSize)}
                placeholder={poster.placeholder}
                // Inline, as next/image frames the placeholder by the same style.
                style={{ objectPosition: poster.position }}
                draggable={false}
              />
            </span>
          )}
          <button
            ref={button}
            type='button'
            className={styles.play}
            // Starts with the visible label so voice control can say what it sees.
            aria-label={[label ? `Load model: ${label}` : 'Load model', size]
              .filter(Boolean)
              .join(', ')}
            // Stays busy through the fade so the spinner never turns back into the glyph.
            aria-busy={active}
            onPointerEnter={warmScene}
            onFocus={warmScene}
            onClick={() => setActive(true)}>
            <span className={styles.disc} aria-hidden>
              {active ? (
                <span className={styles.spinner} />
              ) : (
                // Says what the click gives: a model to turn, or one to look at.
                <Glyph className={styles.glyph} />
              )}
            </span>
            <span className={styles.label} aria-hidden>
              {size ? `Load model · ${size}` : 'Load model'}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
