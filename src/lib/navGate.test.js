import { expect, test } from 'bun:test';
import { navGate } from './navGate';

// A transition and a keyframe animation; only the transition is finished.
const running = () => [
  {
    transitionProperty: 'width',
    finish() {
      this.finished = true;
    }
  },
  {
    animationName: 'spin',
    finish() {
      this.finished = true;
    }
  }
];

// Runs the inline script against a stand-in page whose links overflow or fit.
function page({ overflowing = true, links = true } = {}) {
  const nav = {
    animations: running(),
    getAnimations(options) {
      nav.options = options;
      return nav.animations;
    }
  };
  const html = {
    attributes: {},
    animations: running(),
    setAttribute: (name, value) => (html.attributes[name] = value),
    getAnimations: () => html.animations
  };
  const list = {
    scrollWidth: overflowing ? 500 : 300,
    clientWidth: 300,
    closest: (selector) => (selector === 'nav' ? nav : null)
  };
  const document = {
    documentElement: html,
    querySelector: (selector) =>
      links && selector === '[data-nav-links]' ? list : null
  };
  new Function('document', navGate)(document);
  return { html, nav };
}

test('links that overflow make the bar compact and finish its transitions', () => {
  const { html, nav } = page();
  expect(html.attributes).toEqual({ 'data-nav-compact': '' });
  expect(nav.options).toEqual({ subtree: true });
  expect(nav.animations.map((a) => !!a.finished)).toEqual([true, false]);
  expect(html.animations.map((a) => !!a.finished)).toEqual([true, false]);
});

test('links that fit leave the bar full, but still finish html transitions', () => {
  const { html, nav } = page({ overflowing: false });
  expect(html.attributes).toEqual({});
  expect(nav.options).toBeUndefined();
  expect(html.animations.map((a) => !!a.finished)).toEqual([true, false]);
});

test('a page without links only finishes html transitions', () => {
  const { html } = page({ links: false });
  expect(html.attributes).toEqual({});
  expect(html.animations.map((a) => !!a.finished)).toEqual([true, false]);
});
