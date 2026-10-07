'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuRss } from 'react-icons/lu';
import { baseUrl } from '@/lib/env';
import { FEED_PATH } from '@/lib/feed';
import { copyText } from '@/lib/clipboard';
import styles from '@/styles/components/PostList.module.scss';

const COPIED = 'Feed link copied';
const HOLD = 2000;

// The search capsule holding the feed glyph; a copy opens it leftward into a pill that says so.
export default function CopyFeed() {
  const ref = useRef(null);
  const labelRef = useRef(null);
  const timer = useRef(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await copyText(`${baseUrl}${FEED_PATH}`);
    } catch {
      return;
    }
    // The visitor may have navigated away while the clipboard was written.
    if (!ref.current) return;
    // The pill opens to the label's own width, read once the web font is in; set on the row so the strip can clear the same room.
    ref.current.parentElement.style.setProperty(
      '--copied-width',
      `${labelRef.current.offsetWidth}px`
    );
    clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), HOLD);
  };

  return (
    <button
      ref={ref}
      type='button'
      className={styles.feed}
      aria-label='Copy feed link'
      title='Copy feed link'
      data-copied={copied || undefined}
      onClick={copy}>
      <span className={styles.feedPill} aria-hidden='true'>
        <span ref={labelRef} className={styles.feedSaid}>
          {COPIED}
        </span>
      </span>
      <span className={styles.feedGlyphs} aria-hidden='true'>
        <LuRss strokeWidth={1.75} />
        <LuCheck strokeWidth={2} />
      </span>
      <span className={styles.srOnly} aria-live='polite'>
        {copied ? COPIED : ''}
      </span>
    </button>
  );
}
