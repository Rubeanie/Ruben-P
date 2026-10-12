import { expect, test } from 'bun:test';
import { hold, play } from './reveal';

// The pre-paint script is hold's own source, so it must run with only globals in scope.
test('hold runs from its source alone', () => {
  const run = new Function(
    'document',
    'innerHeight',
    'matchMedia',
    `return (${hold})()`
  );
  const page = { querySelector: () => ({ animate() {}, children: [] }) };
  expect(run(page, 900, () => ({ matches: false }))).toEqual([]);
});

// The script plays units in with play's source too, until the app hydrates.
test('play runs from its source alone', () => {
  const run = new Function(
    'getComputedStyle',
    'matchMedia',
    'unit',
    `return (${play})(unit, 80)`
  );
  const animated = [];
  const el = {
    parentElement: { dataset: {} },
    getAnimations: () => [],
    querySelectorAll: () => [],
    animate: (frames, timing) => animated.push(timing.delay)
  };
  let cancelled = false;
  const held = { cancel: () => (cancelled = true) };
  run(
    () => ({ backdropFilter: 'none' }),
    () => ({ matches: false }),
    [el, 'text', held]
  );
  expect(cancelled).toBe(true);
  expect(animated).toEqual([80, 80]);
});
