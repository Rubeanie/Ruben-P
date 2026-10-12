'use client';

import { useEffect } from 'react';
import { preload } from 'react-dom';
import { warmHero3D } from '@/components/Modules/Hero3D/warm';
import { saveData } from '@/lib/saveData';

// href -> what its page shows first, filled by every render that shows its links.
const known = new Map();
const started = new Set();

// One listener set for the whole page: pointerover and focusin bubble, unlike
// pointerenter and focus, so links added later need no wiring.
function onIntent({ target }) {
  const link = target instanceof Element && target.closest('a[href]');
  if (!link || link.origin !== location.origin || saveData()) return;
  // A link to a heading has its own entry; any other uses its page's opening.
  const key = known.has(link.pathname + link.hash)
    ? link.pathname + link.hash
    : link.pathname;
  const entry = known.get(key);
  if (!entry || started.has(key)) return;
  started.add(key);
  for (const {
    href,
    srcSet,
    template,
    widths,
    sizes,
    ...rest
  } of entry.preloads) {
    const at = (w) => template.replace('{w}', w);
    preload(template ? at(widths.at(-1)) : href, {
      ...rest,
      imageSrcSet: template
        ? widths.map((w) => `${at(w)} ${w}w`).join(', ')
        : srcSet,
      imageSizes: sizes,
      fetchPriority: 'low'
    });
  }
  if (entry.warm3d) warmHero3D();
}

// Warms what the destination shows first (photos, video posters, post covers,
// the 3D hero) when a visitor shows intent to open a link.
export default function IntentImages({ images }) {
  useEffect(() => {
    for (const [href, entry] of Object.entries(images)) known.set(href, entry);
    // Adding the same listener again is a no-op, so every instance can.
    document.addEventListener('pointerover', onIntent);
    document.addEventListener('focusin', onIntent);
    document.addEventListener('touchstart', onIntent, { passive: true });
  }, [images]);
  return null;
}
