// Runs in <head>, before the browser can restore a reload's scroll position.
// Left to the browser, the restore is a jump: Safari's comes at load, after
// the top of the page has shown, and Chrome's glides only when the page grew
// tall enough after its first paint. So a reload restores the position itself
// as soon as the page is tall enough, unless something has scrolled it by
// then: instantly if that's the first frame, which is about to be the first
// paint, so the top never shows; gliding (html's scroll-behavior) after it.
// Paint timing can't prove nothing has painted, so only the first frame, and
// only where the browser reports paints, counts as unseen. A Back or Forward
// that loads the page again (no back/forward cache) is the same: WebKit
// restores at the first layout, before the page has grown, and lands short.
// Back and Forward within the app stay the browser's: restoration is handed
// back after load, before a navigation can copy it.
//
// React reveals a large streamed module (template#B:n) up to 300ms after the
// first paint, pushing down what follows, sometimes after load. So both the
// restore and a heading in the URL wait for those (up to 5s), and the heading
// is glided to again: Safari scrolls to it once, against the page as it stood,
// and lands short. Its scrollIntoView skips the root's scroll-padding, so the
// offset is worked out.
//
// Inlined by its source text, so it stays self-contained and in syntax every
// browser parses as is: no imports, no optional chaining.
function restore(key) {
  const root = document.documentElement;
  // Read at pagehide, as client navigation may have changed the URL since.
  addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(key + location.href, Math.round(scrollY));
    } catch {}
  });

  let heading, position;
  try {
    heading = decodeURIComponent(location.hash.slice(1));
    const navigation = performance.getEntriesByType('navigation')[0];
    if (/^(reload|back_forward)$/.test(navigation && navigation.type))
      position = +sessionStorage.getItem(key + location.href);
  } catch {}
  if (!position && !heading) return;
  if (position) history.scrollRestoration = 'manual';

  // Any input before the page settles is the visitor's own scrolling.
  let moved = false;
  for (const type of ['wheel', 'touchstart', 'keydown'])
    addEventListener(type, () => (moved = true), { once: true, passive: true });

  const paints =
    self.PerformanceObserver &&
    (self.PerformanceObserver.supportedEntryTypes || []).includes('paint');
  let frames = 0;

  requestAnimationFrame(function settle() {
    if (moved) return;
    const unseen =
      frames++ === 0 && paints && !performance.getEntriesByType('paint').length;
    const target = !position && heading && document.getElementById(heading);
    const top = target
      ? target.getBoundingClientRect().top +
        scrollY -
        (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) -
        (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)
      : position;
    const streaming = document.querySelector('template[id^="B:"]');
    const waiting = streaming || !top || root.scrollHeight - innerHeight < top;
    if (
      waiting &&
      (document.readyState !== 'complete' ||
        (streaming && performance.now() < 5000))
    )
      return requestAnimationFrame(settle);
    if (top && !(position && scrollY))
      scrollTo({ top, behavior: position && unseen ? 'instant' : 'auto' });
  });

  addEventListener('load', () =>
    setTimeout(() => (history.scrollRestoration = 'auto'))
  );
}

export const reloadScroll = `(${restore})('scroll:')`;
