import { expect, test } from 'bun:test';
import { reloadScroll } from './reloadScroll';

// Runs the inline script against a stand-in page. `frame()` advances one
// animation frame; `fire(type)` dispatches a window event.
function page({
  type = 'reload',
  hash = '',
  stored,
  height = 0,
  template,
  painted = true
}) {
  const listeners = {};
  const frames = [];
  const scrolls = [];
  const html = { scrollHeight: height };
  const state = { readyState: 'interactive', template };
  const env = {
    history: { scrollRestoration: 'auto' },
    document: {
      documentElement: html,
      get readyState() {
        return state.readyState;
      },
      querySelector: () => state.template ?? null,
      getElementById: (id) =>
        id === 'heading'
          ? { getBoundingClientRect: () => ({ top: 1500 }) }
          : null
    },
    addEventListener: (name, fn) => (listeners[name] = fn),
    sessionStorage: {
      getItem: () => stored ?? null,
      setItem: (key, value) => (env.saved = [key, value])
    },
    location: { href: 'https://example.com/about' + hash, hash },
    performance: {
      getEntriesByType: (kind) =>
        kind === 'paint' ? (painted ? [{}] : []) : [{ type }],
      now: () => 0
    },
    self: { PerformanceObserver: { supportedEntryTypes: ['paint'] } },
    scrollY: 0,
    innerHeight: 900,
    requestAnimationFrame: (fn) => frames.push(fn),
    getComputedStyle: (el) =>
      el === html ? { scrollPaddingTop: '90px' } : { scrollMarginTop: '10px' },
    scrollTo: ({ top, behavior }) => scrolls.push([top, behavior]),
    setTimeout: (fn) => fn()
  };
  new Function(...Object.keys(env), reloadScroll)(...Object.values(env));
  return {
    env,
    scrolls,
    html,
    state,
    frame: () => frames.splice(0).forEach((fn) => fn()),
    fire: (name) => listeners[name]?.()
  };
}

test('a reload glides back once the page is tall enough and settled', () => {
  const p = page({ stored: '1200', height: 1000, template: {} });
  expect(p.env.history.scrollRestoration).toBe('manual');
  p.html.scrollHeight = 3000;
  p.frame();
  expect(p.scrolls).toEqual([]);
  p.state.template = null;
  p.frame();
  expect(p.scrolls).toEqual([[1200, 'auto']]);
  p.fire('load');
  expect(p.env.history.scrollRestoration).toBe('auto');
});

test('a Back that loads the page again glides back too', () => {
  const p = page({ type: 'back_forward', stored: '1200', height: 1000 });
  expect(p.env.history.scrollRestoration).toBe('manual');
  p.html.scrollHeight = 3000;
  p.frame();
  expect(p.scrolls).toEqual([[1200, 'auto']]);
});

test('a reload ready by the first frame jumps there before it paints', () => {
  const p = page({ stored: '1200', height: 3000, painted: false });
  p.frame();
  expect(p.scrolls).toEqual([[1200, 'instant']]);
});

test('a page still short at the first frame glides once it is tall enough', () => {
  const p = page({ stored: '1200', height: 1000, painted: false });
  p.frame();
  p.html.scrollHeight = 3000;
  p.frame();
  expect(p.scrolls).toEqual([[1200, 'auto']]);
});

test('streamed modules are waited for even after load, for a while', () => {
  const p = page({ stored: '1200', height: 3000, template: {} });
  p.state.readyState = 'complete';
  p.frame();
  expect(p.scrolls).toEqual([]);
  p.state.template = null;
  p.frame();
  expect(p.scrolls).toEqual([[1200, 'auto']]);
});

test('a heading in the URL is scrolled to below the scroll padding', () => {
  const p = page({
    type: 'navigate',
    hash: '#heading',
    height: 3000,
    painted: false
  });
  expect(p.env.history.scrollRestoration).toBe('auto');
  p.frame();
  expect(p.scrolls).toEqual([[1400, 'auto']]);
});

test('input before the page settles leaves the scroll alone', () => {
  const p = page({ stored: '1200', height: 1000 });
  p.fire('wheel');
  p.html.scrollHeight = 3000;
  p.frame();
  expect(p.scrolls).toEqual([]);
});

test('a plain load only records the position on the way out', () => {
  const p = page({ type: 'navigate', height: 3000 });
  expect(p.scrolls).toEqual([]);
  p.fire('pagehide');
  expect(p.env.saved).toEqual(['scroll:https://example.com/about', 0]);
});

test('a position is saved under the URL the page has navigated to since', () => {
  const p = page({ type: 'navigate', height: 3000 });
  p.env.location.href = 'https://example.com/work';
  p.fire('pagehide');
  expect(p.env.saved).toEqual(['scroll:https://example.com/work', 0]);
});
