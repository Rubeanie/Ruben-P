import { describe, expect, test } from 'bun:test';
import { coverSizes } from './coverSizes';

describe('coverSizes', () => {
  test('fills by height on screens narrower than the photo', () => {
    expect(coverSizes(1.5, 100)).toBe(
      '(max-aspect-ratio: 150/100) 150vh, 100vw'
    );
  });

  test('folds the zoom into both widths', () => {
    expect(coverSizes(1.5, 100, 100, 1.12)).toBe(
      '(max-aspect-ratio: 150/100) 168vh, 112vw'
    );
  });

  test('falls back to the box width without a ratio', () => {
    expect(coverSizes(undefined, 100)).toBe('100vw');
  });
});
