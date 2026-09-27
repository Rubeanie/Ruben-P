'use client';

import uid from '@/lib/uid';
import { stegaClean } from '@sanity/client/stega';
import { useEffect, useRef } from 'react';

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

  if (!code.includes('<script'))
    return (
      <section
        id={uid(props)}
        className={stegaClean(className)}
        dangerouslySetInnerHTML={{ __html: stegaClean(code) }}
      />
    );

  return (
    <section ref={ref} id={uid(props)} className={stegaClean(className)} />
  );
}
