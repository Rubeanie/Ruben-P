import { hold, holdEntrances, play } from './reveal';

// Runs before first paint on a full load, except one from Back or Forward.
// Lazy modules stream in after it and push down what follows, so it measures
// again after any change until Reveal takes over: before the first paint at
// once, at the usual line; after it at most once a frame, and only below the
// screen, where nothing has been seen. Taking over measures what's pending.
// Until then it also plays units in as they cross the line: on a slow link
// the app hydrates seconds later, and a block scrolled to sat empty till then.
// If the app never hydrates, everything shows after five seconds.
//
// Inlined by its source text, so it stays self-contained and in syntax every
// browser parses as is: no imports, no optional chaining.
function watch(hold, holdEntrances, play) {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation && navigation.type === 'back_forward') return;
  // A unit played in has been seen, so scrolled back below the line it stays.
  const played = new Set();
  const measure = (edge) =>
    hold(false, edge)
      .concat(holdEntrances(edge))
      .filter((unit) => {
        if (!played.has(unit[0])) return true;
        unit[2].cancel();
        return false;
      });

  // In reading order, and a unit never starts before the one above it.
  const units = new Map();
  let next = 0;
  const visible = new IntersectionObserver(
    (entries) => {
      const now = performance.now();
      entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => units.get(entry.target))
        .sort((a, b) => (a[0].compareDocumentPosition(b[0]) & 4 ? -1 : 1))
        .forEach((unit) => {
          visible.unobserve(unit[0]);
          played.add(unit[0]);
          const delay = Math.min(Math.max(0, next - now), 300);
          next = now + delay + (unit[1] === 'item' ? 50 : 80);
          play(unit, delay);
        });
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  const watched = (edge) => {
    const found = measure(edge);
    for (const unit of found)
      if (unit[1] !== 'entrance') {
        units.set(unit[0], unit);
        visible.observe(unit[0]);
      }
    return found;
  };

  let held = watched(0.9);
  let frame = 0;
  const changes = new MutationObserver(() => {
    if (!performance.getEntriesByType('paint').length)
      held = held.concat(watched(0.9));
    else if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        held = held.concat(watched(1));
      });
  });
  const disconnect = () => {
    changes.disconnect();
    visible.disconnect();
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      held = held.concat(measure(1));
    }
  };
  self.__revealWatch = { disconnect };
  changes.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    disconnect();
    held.forEach((unit) => unit[2].cancel());
  }, 5000);
}

export const revealWatch = `(${watch})(${hold}, ${holdEntrances}, ${play})`;
