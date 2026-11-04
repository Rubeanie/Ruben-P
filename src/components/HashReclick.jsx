'use client';

import { useEffect } from 'react';

// Next's Link scrolls to a heading only when the hash changes, so it ignores a
// click on the /page#heading already in the address bar. This scrolls there the
// way Next's first click does, without a navigation or a history entry. Bare
// #id links are native and left alone.
export function HashReclick() {
  useEffect(() => {
    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const a = event.target.closest?.('a[href]');
      if (
        !a ||
        a.getAttribute('href').startsWith('#') ||
        a.hasAttribute('download') ||
        (a.target && a.target !== '_self') ||
        !a.hash ||
        a.href !== location.href
      )
        return;
      let id;
      try {
        id = decodeURIComponent(a.hash.slice(1));
      } catch {
        return;
      }
      // Link checks this before navigating.
      event.preventDefault();
      // Headings carry ids; the page renders no named anchors.
      const target = id === 'top' ? document.body : document.getElementById(id);
      target?.scrollIntoView();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
