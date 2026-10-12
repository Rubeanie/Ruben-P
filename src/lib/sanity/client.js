import { createClient } from 'next-sanity';
import { isDev } from '@/lib/env';
import { projectId, dataset, apiVersion } from '@/lib/env';

export default createClient({
  projectId: projectId,
  dataset: dataset,
  apiVersion: apiVersion,
  // Private dataset: tokenless reads return null, not an error. defineLive
  // drops its server token for published fetches, so the client needs its own.
  // Server-only; the browser bundle gets undefined and SanityLive's browserToken.
  token: process.env.SANITY_READ_TOKEN,
  useCdn: !isDev,
  stega: {
    enabled: false,
    studioUrl: '/admin'
  }
});
