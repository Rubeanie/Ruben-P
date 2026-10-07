'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { preconnect } from 'react-dom';
import Image from 'next/image';
import { LuPlay } from 'react-icons/lu';
import {
  embedSrc,
  IFRAME_ALLOW,
  isApple,
  loadPlayerApi,
  prebuildsPlayer,
  warmEmbed,
  whenIdle
} from '@/lib/youtube';
import { PROSE_SIZES, sizedSizes } from '@/lib/imageBlock';
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
  preload = false,
  loading,
  sizes = PROSE_SIZES,
  className,
  // Inside a figure, which carries the block's size, alignment and sanity key.
  framed = false,
  // Set on a carousel card: `paused` while it is away from the front,
  // `prebuild` only near it, and `onPlay` claims the carousel's one player.
  inCarousel = false,
  paused = false,
  prebuild = true,
  onPlay
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

  // A player built ahead of a tap goes once its card is no longer near; one
  // that has played stays until another card takes the carousel's player.
  if (mode && !prebuild && !loaded && !active) setMode(null);
  // A plain embed (the API failed to load) can't be paused, so leaving the
  // front takes it back to its poster.
  if (inCarousel && paused && mode === 'plain') {
    setMode(null);
    setLoaded(false);
    setActive(false);
  }

  // Phones never hover, so build the player once the video is near the screen.
  useEffect(() => {
    if (!prebuildsPlayer() || !prebuild) return;
    let cancelled = false;
    let cancelIdle;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        cancelIdle = whenIdle(() => {
          warmEmbed();
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
  }, [prebuild]);

  const play = (event) => {
    onPlay?.();
    if (player.current) {
      // A press on the edge band can't start playback: iOS only plays from a
      // tap inside the frame. The keyboard has no such tap.
      if (ready && event.detail > 0) return;
      setActive(true);
      return player.current.playVideo();
    }
    setActive(true);
    // A carousel player must take a pause at any moment, so it always has the API.
    if (!inCarousel && !isApple()) return setMode('plain');
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

  // A tap inside a pre-built player starts it without passing through play().
  const claim = useEffectEvent(() => onPlay?.());
  const isPaused = useEffectEvent(() => paused);

  useEffect(() => {
    if (mode !== 'api') return;
    const { PlayerState } = window.YT;
    const instance = new window.YT.Player(frame.current, {
      events: {
        onReady: (event) => {
          player.current = event.target;
          if (prebuildsPlayer()) {
            // A tap before this moment can't play; the next one lands in the frame.
            setReady(true);
          } else if (!isPaused()) {
            return event.target.playVideo();
          }
          // Left the front while loading, it waits for the next press.
          setActive(false);
        },
        onStateChange: (event) => {
          const starting = [PlayerState.BUFFERING, PlayerState.PLAYING];
          if (starting.includes(event.data) && isPaused()) {
            event.target.pauseVideo();
            return setActive(false);
          }
          if (event.data === PlayerState.BUFFERING) setActive(true);
          if (event.data === PlayerState.PLAYING) {
            claim();
            reveal();
          }
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

  // Leaving the front pauses; coming back waits for a press on the player.
  // A player still loading checks on ready instead.
  useEffect(() => {
    if (paused) player.current?.pauseVideo();
  }, [paused]);

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
      className={`${styles.video} ${className ?? ''}`.trim()}
      {...(!framed && blockLayout(size, align))}
      {...(!framed && sanity && { 'data-sanity': sanity })}>
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
          data-armed={(mode === 'api' && !ready && !loaded) || undefined}
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
            sizes={sizedSizes(sizes, blockLayout(size, align)['data-size'])}
            preload={preload}
            loading={loading}
          />
          <button
            ref={button}
            type='button'
            className={styles.play}
            aria-busy={active}
            onPointerEnter={warmEmbed}
            onFocus={warmEmbed}
            onClick={play}>
            <span className={styles.scrim} aria-hidden />
            <span className={styles.disc} aria-hidden>
              {active ? (
                <span className={styles.spinner} />
              ) : (
                <LuPlay viewBox='5 2 16 20' />
              )}
            </span>
            <span className={styles.srOnly}>Play video:</span>
            <span className={styles.caption}>
              <span>{title}</span>
              <span>YouTube</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
