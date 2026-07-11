import { sanityFetch } from './live';

export { default as groq } from 'groq';

// Keeps the existing fetchSanity signature. sanityFetch handles draft mode
// (drafts perspective, stega) and sync-tag caching itself.
export async function fetchSanity(query, { params = {}, tags = [] } = {}) {
  const { data } = await sanityFetch({ query, params, tags });
  return data;
}
