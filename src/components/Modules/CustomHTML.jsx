'use client';

import uid from '@/lib/uid';
import { stegaClean } from '@sanity/client/stega';
import { useEffect, useRef } from 'react';
import styles from '@/styles/components/CustomHTML.module.scss';

export default function CustomHTML({ className, html, ...props }) {
  const ref = useRef(null);
  const injectedRef = useRef(false);
  const code = html?.code;

  // Inject the script fragment once; the ref flag makes any re-run a no-op.
  useEffect(() => {
    if (injectedRef.current) return;
    if (!code || !code.includes('<script')) return;
    injectedRef.current = true;
    const parsed = document
      .createRange()
      .createContextualFragment(stegaClean(code));
    ref.current?.appendChild(parsed);
  }, [code]);

  if (!code) return null;
  const classes = [styles.html, stegaClean(className)]
    .filter(Boolean)
    .join(' ');

  if (!code.includes('<script'))
    return (
      <section
        id={uid(props)}
        className={classes}
        dangerouslySetInnerHTML={{ __html: stegaClean(code) }}
      />
    );

  return <section ref={ref} id={uid(props)} className={classes} />;
}
