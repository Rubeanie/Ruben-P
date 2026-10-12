'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuLink } from 'react-icons/lu';
import { copyText } from '@/lib/clipboard';
import styles from '@/styles/components/RichText.module.scss';

const HOLD = 1500;

// The check never flips while it is on screen: after the hold it cross-fades
// back if the glyph is still showing, and swaps unseen if it has faded out.
export default function HeadingLink({ id, label }) {
  const ref = useRef(null);
  const timer = useRef(0);
  const [copied, setCopied] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (event) => {
    // Copies in place: the reader keeps their scroll position.
    event.preventDefault();
    history.replaceState(history.state, '', `#${id}`);
    try {
      await copyText(location.href);
    } catch {
      return;
    }
    clearTimeout(timer.current);
    setInstant(true);
    setCopied(true);
    timer.current = setTimeout(() => {
      setInstant(parseFloat(getComputedStyle(ref.current).opacity) === 0);
      setCopied(false);
    }, HOLD);
  };

  return (
    <a
      ref={ref}
      href={`#${id}`}
      className={styles.headingLink}
      aria-label={`Copy link to ${label}`}
      data-copied={copied || undefined}
      data-instant={instant || undefined}
      onClick={copy}>
      <span className={styles.headingGlyphs} aria-hidden='true'>
        <LuLink strokeWidth={1.5} />
        <LuCheck strokeWidth={2} />
      </span>
      <span className={styles.srOnly} aria-live='polite'>
        {copied ? 'Link copied' : ''}
      </span>
    </a>
  );
}
