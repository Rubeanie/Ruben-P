import { expect, test } from 'bun:test';
import { hold } from './reveal';

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
