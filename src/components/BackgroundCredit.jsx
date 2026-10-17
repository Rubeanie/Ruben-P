'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { captionText } from '@/components/RichText/FigureCaption';
import styles from '@/styles/components/Footer.module.scss';

const subscribe = () => () => {};

// The head script picks the background before React runs, so the server never
// knows whose photo it is; the credit waits for hydration.
export default function BackgroundCredit() {
  const { theme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  if (!hydrated) return null;

  const { source, credit } = theme;
  const by =
    source === 'visitor'
      ? 'from your device'
      : credit && (
          <>by {captionText({ caption: credit.name, source: credit.href })}</>
        );
  if (!by) return null;

  return (
    <>
      <span className={styles.dot} aria-hidden='true'>
        {' · '}
      </span>
      <span className={styles.credit}>Background photo {by}</span>
    </>
  );
}
