'use client';

import { useRef, useState } from 'react';
import { preconnect } from 'react-dom';
import Image from 'next/image';
import { embedSrc, IFRAME_ALLOW } from '@/lib/youtube';
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
  sanity
}) {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const button = useRef(null);
  const frame = useRef(null);

  // Intent to play is the cheapest moment to open the sockets the embed needs.
  const warm = () => {
    preconnect('https://www.youtube-nocookie.com');
    preconnect('https://www.google.com');
  };

  const pending = active && !loaded;

  return (
    <div
      className={styles.video}
      {...blockLayout(size, align)}
      {...(sanity && { 'data-sanity': sanity })}>
      {!loaded && (
        <>
          <Image
            src={thumb}
            alt=''
            fill
            sizes='(max-width: 43.75rem) 100vw, 65rem'
            priority={false}
          />
          <button
            ref={button}
            type='button'
            className={styles.play}
            aria-label={`Play video: ${title}`}
            aria-busy={pending}
            onPointerEnter={warm}
            onFocus={warm}
            onClick={() => setActive(true)}>
            <span className={styles.scrim} aria-hidden />
            <span className={styles.disc} aria-hidden>
              {pending ? (
                <span className={styles.spinner} />
              ) : (
                <svg viewBox='27 14 18 20'>
                  <path d='M45 24 27 14v20' />
                </svg>
              )}
            </span>
            <span className={styles.caption} aria-hidden>
              <span>{title}</span>
              <span>YouTube</span>
            </span>
          </button>
        </>
      )}
      {active && (
        <iframe
          ref={frame}
          src={embedSrc(id, { controls, start, autoplay: true, mute: false })}
          title={title}
          loading='lazy'
          allow={IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy='strict-origin-when-cross-origin'
          onLoad={() => {
            // Hand focus to the player only if the play button still had it.
            const hadFocus = document.activeElement === button.current;
            setLoaded(true);
            if (hadFocus) requestAnimationFrame(() => frame.current?.focus());
          }}
          data-loaded={loaded || undefined}
        />
      )}
    </div>
  );
}
