'use client';

import { useEffect, useRef, useState } from 'react';
import { preconnect } from 'react-dom';
import Image from 'next/image';
import { MdPlayArrow } from 'react-icons/md';
import {
  embedSrc,
  IFRAME_ALLOW,
  isApple,
  loadPlayerApi,
  prebuildsPlayer,
  whenIdle
} from '@/lib/youtube';
import { blockLayout } from './layout';
import styles from '@/styles/components/RichText.module.scss';

export default function YouTubeFacade({
  id,
  title,
  thumb,
  controls,
  start,
  size,
  align,
  sanity,
  priority = false
}) {
  const [active, setActive] = useState(false);
  // 'api' drives the iframe through the IFrame Player API, 'plain' relies on autoplay=1.
  const [mode, setMode] = useState(null);
  // Only set on devices that build the player before the tap.
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const player = useRef(null);
  const root = useRef(null);
  const button = useRef(null);
  const frame = useRef(null);

  // Intent to play is the cheapest moment to open the sockets the embed needs.
  const warm = () => {
    preconnect('https://www.youtube-nocookie.com');
    preconnect('https://www.google.com');
  };

  // Phones never hover, so build the player once the video is near the screen.
  useEffect(() => {
    if (!prebuildsPlayer()) return;
    let cancelled = false;
    let cancelIdle;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        cancelIdle = whenIdle(() => {
          warm();
          preconnect('https://www.youtube.com');
          loadPlayerApi().then(
            () => !cancelled && setMode((current) => current ?? 'api'),
            () => {}
          );
        });
      },
      { rootMargin: '50% 0px' }
    );
    observer.observe(root.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      cancelIdle?.();
    };
  }, []);

  const play = (event) => {
    if (prebuildsPlayer() && ready) {
      // A press on the edge band can't start playback: iOS only plays from a
      // tap inside the frame. The keyboard has no such tap.
      if (event.detail > 0) return;
      setActive(true);
      return player.current.playVideo();
    }
    setActive(true);
    if (!isApple()) return setMode('plain');
    loadPlayerApi().then(
      () => setMode((current) => current ?? 'api'),
      () => setMode((current) => current ?? 'plain')
    );
  };

  const reveal = () => {
    // Hand focus to the player only if the play button still had it.
    const hadFocus = document.activeElement === button.current;
    setLoaded(true);
    if (hadFocus) requestAnimationFrame(() => frame.current?.focus());
  };

  useEffect(() => {
    if (mode !== 'api') return;
    const { PlayerState } = window.YT;
    const instance = new window.YT.Player(frame.current, {
      events: {
        onReady: (event) => {
          player.current = event.target;
          if (!prebuildsPlayer()) return event.target.playVideo();
          // A tap before this moment can't play; the next one lands in the frame.
          setReady(true);
          setActive(false);
        },
        onStateChange: (event) => {
          if (event.data === PlayerState.BUFFERING) setActive(true);
          if (event.data === PlayerState.PLAYING) reveal();
        },
        // Nothing more to wait for; let the player show its own play button or error.
        onAutoplayBlocked: reveal,
        onError: reveal
      }
    });
    return () => {
      try {
        instance.destroy();
      } catch {
        // The iframe is already gone
      }
      player.current = null;
      setReady(false);
    };
  }, [mode]);

  // A tap that lands inside the player moves focus into its frame.
  useEffect(() => {
    if (!ready || loaded) return;
    const press = () => {
      if (document.activeElement === frame.current) setActive(true);
    };
    window.addEventListener('blur', press);
    return () => window.removeEventListener('blur', press);
  }, [ready, loaded]);

  return (
    <div
      ref={root}
      className={styles.video}
      {...blockLayout(size, align)}
      {...(sanity && { 'data-sanity': sanity })}>
      {mode && (
        <iframe
          ref={frame}
          src={embedSrc(id, {
            controls,
            start,
            autoplay: mode === 'plain',
            mute: false,
            api: mode === 'api'
          })}
          title={title}
          loading={mode === 'api' ? 'eager' : 'lazy'}
          allow={IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy='strict-origin-when-cross-origin'
          tabIndex={mode === 'api' && !loaded ? -1 : undefined}
          onLoad={mode === 'plain' ? reveal : undefined}
          data-armed={(mode === 'api' && !ready) || undefined}
          data-loaded={loaded || ready || undefined}
        />
      )}
      {/* A pre-built player sits under the facade, which fades out instead of unmounting. */}
      {(!loaded || ready) && (
        <div
          className={styles.facade}
          data-through={ready || undefined}
          inert={loaded}>
          <Image
            src={thumb}
            alt=''
            fill
            sizes='(max-width: 43.75rem) 100vw, 65rem'
            priority={priority}
          />
          <button
            ref={button}
            type='button'
            className={styles.play}
            aria-label={`Play video: ${title}`}
            aria-busy={active}
            onPointerEnter={warm}
            onFocus={warm}
            onClick={play}>
            <span className={styles.scrim} aria-hidden />
            <span className={styles.disc} aria-hidden>
              {active ? (
                <span className={styles.spinner} />
              ) : (
                <MdPlayArrow viewBox='8 5 11 14' />
              )}
            </span>
            <span className={styles.caption} aria-hidden>
              <span>{title}</span>
              <span>YouTube</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
