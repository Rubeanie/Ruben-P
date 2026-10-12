import { createPageSpeedHandler } from '@/lib/pagespeed';

// Lighthouse can take most of a minute.
export const maxDuration = 60;

// Google's live SEO check for signed-in Studio members; see pagespeed.js.
export const POST = createPageSpeedHandler();
