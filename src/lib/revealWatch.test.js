import { expect, test } from 'bun:test';
import { revealWatch } from './revealWatch';

// A module at `top`, recording the animations made on it.
function element(top) {
  const el = {
    top,
    animations: [],
    children: [],
    parentElement: { dataset: {} },
    matches: () => false,
    hasAttribute: () => false,
    querySelector: () => null,
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: el.top, height: 100 }),
    getAnimations: () => el.animations,
    // Page order follows the stand-in's top.
    compareDocumentPosition: (other) => (other.top > el.top ? 4 : 2),
    animate(frames, { id, delay }) {
      const animation = {
        id,
        delay,
        cancel: () => el.animations.splice(el.animations.indexOf(animation), 1)
      };
      el.animations.push(animation);
      return animation;
    }
  };
  return el;
}

const held = (el) => el.animations.some((a) => a.id === 'reveal');

// Runs the inline script against a stand-in page. `cross(...els)` reports
// elements crossing the line, `change()` a streamed module, `frame()` the
// next animation frame.
function page({ type = 'navigate', painted = false, modules }) {
  const observed = new Set();
  const frames = [];
  const timers = [];
  let crossing, changed;
  const env = {
    self: {},
    innerHeight: 1000,
    document: {
      body: {},
      querySelector: () => ({ animate() {}, children: modules }),
      querySelectorAll: () => []
    },
    performance: {
      getEntriesByType: (kind) =>
        kind === 'paint' ? (painted ? [{}] : []) : [{ type }],
      now: () => 0
    },
    matchMedia: () => ({ matches: false }),
    getComputedStyle: () => ({ backdropFilter: 'none' }),
    IntersectionObserver: class {
      constructor(fn) {
        crossing = fn;
      }
      observe = (el) => observed.add(el);
      unobserve = (el) => observed.delete(el);
      disconnect = () => observed.clear();
    },
    MutationObserver: class {
      constructor(fn) {
        changed = fn;
      }
      observe() {}
      disconnect() {}
    },
    requestAnimationFrame: (fn) => frames.push(fn),
    cancelAnimationFrame: () => frames.splice(0),
    setTimeout: (fn) => timers.push(fn)
  };
  new Function(...Object.keys(env), revealWatch)(...Object.values(env));
  return {
    env,
    observed,
    cross: (...els) =>
      crossing(els.map((target) => ({ target, isIntersecting: true }))),
    change: () => changed(),
    frame: () => frames.splice(0).forEach((fn) => fn()),
    timeout: () => timers.splice(0).forEach((fn) => fn())
  };
}

test('the script parses in syntax every browser reads', () => {
  expect(revealWatch).not.toMatch(/\?\.|\?\?/);
});

test('Back or Forward leaves the page as it was', () => {
  const below = element(1200);
  const p = page({ type: 'back_forward', modules: [below] });
  expect(held(below)).toBe(false);
  expect(p.env.self.__revealWatch).toBeUndefined();
});

test('units below the line are held and play in reading order', () => {
  const above = element(500);
  const first = element(1200);
  const second = element(1500);
  const p = page({ modules: [above, first, second] });
  expect([above, first, second].map(held)).toEqual([false, true, true]);
  expect([...p.observed]).toEqual([first, second]);
  p.cross(second, first);
  expect([first, second].map(held)).toEqual([false, false]);
  expect(first.animations.map((a) => a.delay)).toEqual([0, 0]);
  expect(second.animations.map((a) => a.delay)).toEqual([80, 80]);
});

test('everything shows after five seconds without the app', () => {
  const below = element(1200);
  const p = page({ modules: [below] });
  p.timeout();
  expect(held(below)).toBe(false);
  expect(p.observed.size).toBe(0);
});

test('a unit played in is not held again once scrolled back below', () => {
  const below = element(1200);
  const p = page({ painted: true, modules: [below] });
  p.cross(below);
  p.change();
  p.frame();
  expect(held(below)).toBe(false);
  expect(p.observed.size).toBe(0);
});

test('nor when Reveal takes over mid-frame', () => {
  const below = element(1200);
  const p = page({ painted: true, modules: [below] });
  p.cross(below);
  p.change();
  p.env.self.__revealWatch.disconnect();
  expect(held(below)).toBe(false);
});
