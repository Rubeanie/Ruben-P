import { useEffect, useState } from 'react';
import { structureKey } from '@/lib/toc';
import { currentAt, follow, knots, stale } from '@/lib/tocSpy';

// The id of the current heading, null until the reader reaches the first one.
// The knots are cached until the layout changes; the pick is checked once
// per frame while the page scrolls, and not at all when idle.
export function useSpy(entries) {
  const [active, setActive] = useState(null);
  const key = structureKey(entries);
  useEffect(() => {
    const ids = entries.map((entry) => entry.id);
    const els = ids.map((id) => document.getElementById(id));
    if (els.some((el) => !el)) return;
    let cache = null;
    const frame = () => {
      if (stale(cache)) cache = knots(els);
      setActive(ids[currentAt(scrollY, cache)] ?? null);
    };
    return follow(frame, () => (cache = null));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}
