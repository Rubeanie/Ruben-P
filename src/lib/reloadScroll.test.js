import { expect, test } from 'bun:test';
import { reloadScroll } from './reloadScroll';

// Runs the inline script against a stand-in page. `frame()` advances one
// animation frame; `fire(type)` dispatches a window event.
function page({ type = 'reload', hash = '', stored, height = 0, template }) {
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
    performance: { getEntriesByType: () => [{ type }] },
    scrollY: 0,
    innerHeight: 900,
    requestAnimationFrame: (fn) => frames.push(fn),
    getComputedStyle: (el) =>
      el === html ? { scrollPaddingTop: '90px' } : { scrollMarginTop: '10px' },
    scrollTo: (x, y) => scrolls.push(y),
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
  expect(p.scrolls).toEqual([1200]);
  p.fire('load');
  expect(p.env.history.scrollRestoration).toBe('auto');
});

test('a heading in the URL is scrolled to below the scroll padding', () => {
  const p = page({ type: 'navigate', hash: '#heading', height: 3000 });
  expect(p.env.history.scrollRestoration).toBe('auto');
  expect(p.scrolls).toEqual([1400]);
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
