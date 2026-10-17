import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { draftMode } from 'next/headers';
import client from './client';
import { sanityFetch } from './live';
import { SANITY_TAG } from './tag';

export { default as groq } from 'groq';

// Fetches one Sanity read under the shared cache tag; extra options such as
// perspective and stega pass straight through.
export async function fetchSanity(query, { params = {}, ...options } = {}) {
  // Published reads skip sanityFetch: it first makes an uncached request for
  // sync tags that only SanityLive outside draft mode would use, and the
  // webhook revalidates our own tag instead.
  if (!(await draftMode()).isEnabled)
    return client.fetch(query, params, {
      perspective: 'published',
      stega: false,
      useCdn: true,
      // So the CDN can't serve a stale result once the webhook has revalidated;
      // left off during next build, as sanityFetch does.
      cacheMode:
        process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
          ? undefined
          : 'noStale',
      ...options,
      next: { revalidate: false, tags: [SANITY_TAG] }
    });

  // Draft mode: sanityFetch handles the drafts perspective and stega.
  const { data } = await sanityFetch({
    query,
    params,
    tags: [SANITY_TAG],
    ...options
  });
  return data;
}
