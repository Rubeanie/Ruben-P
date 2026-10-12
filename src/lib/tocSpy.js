// Headings become current as they cross this line, a share of the view height.
export const READ_LINE = 0.3;

// Scroll positions at which each heading becomes current. Normally that is
// when it reaches a line 30% down the view. The outline is finished once the
// footer starts to show (the bottom of the page when there is none), so the
// last half screen before that point is compressed until every heading fits.
// Positions are in document coordinates, so they hold until the layout changes.
export function knots(els) {
  const vh = innerHeight;
  const line = vh * READ_LINE;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const footer = document.querySelector('footer');
  const done = footer
    ? Math.min(
        max,
        Math.max(0, footer.getBoundingClientRect().top + scrollY - vh)
      )
    : max;
  const natural = els.map(
    (el) => el.getBoundingClientRect().top + scrollY - line
  );
  const main = document.querySelector('main');
  // Where the line would be when it reaches the end of the content.
  const end = Math.max(
    main.getBoundingClientRect().bottom + scrollY - line,
    natural.at(-1) + 1
  );
  const from = Math.max(0, done - vh * 0.5);
  const squeeze = end > done ? (done - from) / (end - from) : 1;
  const at = natural.map((t) => (t <= from ? t : from + (t - from) * squeeze));
  return { at, done, vh, height: document.documentElement.scrollHeight };
}

// Knots measured for another viewport height or page length are stale,
// whether or not a resize event said so.
export const stale = (k) =>
  !k ||
  k.vh !== innerHeight ||
  k.height !== document.documentElement.scrollHeight;

// Index of the current heading for a scroll position; once the footer shows,
// the last. Before the first heading reaches the line there is none (-1).
export function currentAt(y, { at, done }) {
  if (y >= done - 1) return at.length - 1;
  return at.findLastIndex((t) => t <= y);
}

// Fill for a progress line: 0 at the top, each heading's mark as it becomes
// current, the end of the track exactly where the footer starts to show.
export function fillAt(y, { at, done }, marks, full) {
  const points = [
    ...(at[0] > 0 ? [[0, 0]] : []),
    ...at.map((t, i) => [t, marks[i]]),
    [Math.max(done, at.at(-1) + 1), full]
  ];
  if (y <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    if (y <= x1) {
      const [x0, y0] = points[i - 1];
      return y0 + ((y - x0) / (x1 - x0 || 1)) * (y1 - y0);
    }
  }
  return full;
}

// Runs `frame` at most once per animation frame, and only after a scroll or a
// layout change; `invalidate` marks cached measurements stale. Nothing runs while idle.
export function follow(frame, invalidate, observe = []) {
  let pending = 0;
  const run = () => {
    pending = 0;
    frame();
  };
  const schedule = () => pending || (pending = requestAnimationFrame(run));
  const relayout = () => {
    invalidate();
    schedule();
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', relayout);
  const ro = new ResizeObserver(relayout);
  [document.body, ...observe].forEach((el) => el && ro.observe(el));
  run();
  return () => {
    cancelAnimationFrame(pending);
    removeEventListener('scroll', schedule);
    removeEventListener('resize', relayout);
    ro.disconnect();
  };
}
