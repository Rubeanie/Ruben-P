import { baseUrl } from '@/lib/env';

// A page's generated share card, drawn by the /og route.
export const shareImageUrl = (path) =>
  `${baseUrl}/og${path === '/' ? '' : path}`;
