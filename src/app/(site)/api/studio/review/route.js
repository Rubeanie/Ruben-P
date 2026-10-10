import { createReviewHandler } from '@/lib/studioReview';

// A slow model can take most of a minute.
export const maxDuration = 60;

// Proofreading and SEO suggestions for signed-in Studio members; see studioReview.js.
export const POST = createReviewHandler();
