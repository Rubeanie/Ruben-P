import { describe, expect, test } from 'bun:test';
import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  test('gives megabytes to one decimal', () => {
    expect(formatBytes(4404019)).toBe('4.2 MB');
  });

  test('gives whole kilobytes under a megabyte', () => {
    expect(formatBytes(294912)).toBe('288 KB');
    expect(formatBytes(1048575)).toBe('1.0 MB');
    expect(formatBytes(12)).toBe('1 KB');
  });

  test('returns null for an unknown size', () => {
    expect(formatBytes(null)).toBe(null);
    expect(formatBytes(undefined)).toBe(null);
    expect(formatBytes(0)).toBe(null);
  });
});
