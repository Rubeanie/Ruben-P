import { unstable_cache } from 'next/cache';

// jsdom is slow to load and the same few logos come round every render, so the
// sanitiser is imported on a miss only and each result is kept until a publish.
export const sanitizeLogo = unstable_cache(
  async (svg) => (await import('./sanitizeSvg')).sanitizeSvg(svg),
  ['sanitized-logo'],
  { tags: ['site'] }
);
