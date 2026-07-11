'use client';

import uid from '@/lib/uid';
import { stegaClean } from '@sanity/client/stega';
import { useEffect, useRef } from 'react';

export default function CustomHTML({ className, html, ...props }) {
  const ref = useRef(null);
  const injectedRef = useRef(false);

  // Inject the script fragment once. The ref flag makes any re-run — StrictMode's
  // double-invoke or an html.code change — a no-op, so the script runs exactly once.
  useEffect(() => {
    if (injectedRef.current) return;
    if (!html.code || !html.code.includes('<script')) return;
    injectedRef.current = true;
    const parsed = document
      .createRange()
      .createContextualFragment(stegaClean(html.code));
    ref.current?.appendChild(parsed);
  }, [html.code]);

  if (!html.code) return null;

  if (!html.code.includes('<script'))
    return (
      <section
        id={uid(props)}
        className={stegaClean(className)}
        dangerouslySetInnerHTML={{ __html: stegaClean(html.code) }}
      />
    );

  return (
    <section ref={ref} id={uid(props)} className={stegaClean(className)} />
  );
}
