import { useEffect, useState } from 'react';
import { structureKey } from '@/lib/toc';
import {
  READ_LINE,
  currentAt,
  fillAt,
  follow,
  knots,
  stale
} from '@/lib/tocSpy';

const motion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

// An outline taller than the rail scrolls, as a last resort, to keep the
// current link in view; it moves the rail only, never the page. On the last
// link the whole end of the line must show too.
function keepInView(nav, link, last) {
  if (!link || nav.scrollHeight <= nav.clientHeight + 1) return;
  if (last) return void nav.scrollTo({ top: nav.scrollHeight });
  const top =
    link.getBoundingClientRect().top -
    nav.getBoundingClientRect().top +
    nav.scrollTop;
  if (
    top < nav.scrollTop ||
    top + link.offsetHeight > nav.scrollTop + nav.clientHeight
  )
    nav.scrollTo({ top: top - nav.clientHeight / 3, behavior: motion() });
}

// One loop follows the reading position for both outlines: the current
// heading (null until the reader reaches the first one), whether the rail has
// arrived, and on wide screens the rail's progress line and scroll. It runs at
// most once per frame after a scroll or a layout change, and not at all when
// idle. The rail's sections are observed too, so every frame of one opening
// or closing moves the line and the rail with it until it settles.
export function useSpy(entries, { block, nav, track, mark }) {
  const [active, setActive] = useState(null);
  const [shown, setShown] = useState(false);
  const key = structureKey(entries);
  useEffect(() => {
    const ids = entries.map((entry) => entry.id);
    const els = ids.map((id) => document.getElementById(id));
    if (els.some((el) => !el)) return;
    const links = ids.map((id) =>
      track.current.querySelector(`a[href="#${CSS.escape(id)}"]`)
    );
    let cache = null;
    const frame = () => {
      if (stale(cache)) cache = knots(els);
      const index = currentAt(scrollY, cache);
      setActive(ids[index] ?? null);
      // The rail arrives when the block reaches the reading line, the same
      // line the headings switch at, so a block at the top shows at once.
      setShown(
        block.current.getBoundingClientRect().top < innerHeight * READ_LINE
      );

      const box = track.current.getBoundingClientRect();
      if (!box.height) return;
      // The line is scroll-linked, so it has no transition; its marks are the
      // links' live positions.
      const marks = links.map((link) => {
        const r = link.firstElementChild.getBoundingClientRect();
        return r.top - box.top + r.height / 2;
      });
      const y = fillAt(scrollY, cache, marks, box.height);
      // Never past the end of the track, so the rail cannot grow a scrollbar.
      const fill = Math.min(box.height, Math.max(0, y));
      mark.current.style.transform = `scaleY(${fill})`;
      keepInView(nav.current, links[index], index === links.length - 1);
    };
    const sections = track.current.querySelectorAll('[data-sub]');
    return follow(frame, () => (cache = null), [track.current, ...sections]);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { active, shown };
}
