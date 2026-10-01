import { sanityFetch } from './live';

export { default as groq } from 'groq';

// Keeps the existing fetchSanity signature. sanityFetch handles draft mode
// (drafts perspective, stega) and sync-tag caching itself; extra options such as
// perspective and stega pass straight through.
export async function fetchSanity(
  query,
  { params = {}, tags = [], ...options } = {}
) {
  const { data } = await sanityFetch({ query, params, tags, ...options });
  return data;
}
