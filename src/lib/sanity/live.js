import { defineLive } from 'next-sanity/live';
import client from './client';

// sanityFetch tags every query with sync tags; SanityLive (in the root layout)
// revalidates them when content changes.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_READ_TOKEN,
  browserToken: process.env.SANITY_READ_TOKEN
});
