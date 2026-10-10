import { defineLive } from 'next-sanity/live';
import client from './client';

// Draft mode only: sanityFetch reads drafts with stega, and SanityLive
// refreshes the page when content changes.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_READ_TOKEN,
  // Sent to the browser in draft mode, so it's a separate Viewer token that
  // can be revoked without breaking published reads.
  browserToken: process.env.SANITY_BROWSER_TOKEN
});
