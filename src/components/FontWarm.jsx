'use client';

import { useEffect } from 'react';
import { whenIdle } from '@/lib/youtube';

// The faces the stylesheets use beyond the two preloaded ones (Figtree and
// Mont 600).
const FACES = [
  '400 1em mont',
  '500 1em mont',
  '700 1em mont',
  'italic 1em figtree',
  '1em jetbrainsMono'
];

// A face loads on its first use, so a page reached by a client navigation
// painted its headings in the fallback and reflowed a moment later, which also
// pushed held reveal units into view. Loaded once the first page is idle,
// every later page paints in its own type.
export function FontWarm() {
  useEffect(
    () => whenIdle(() => FACES.forEach((face) => document.fonts.load(face))),
    []
  );
  return null;
}
