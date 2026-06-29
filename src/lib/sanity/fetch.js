import client from '@/lib/sanity/client';
import { isDev } from '@/lib/env';
import { draftMode } from 'next/headers';

export { default as groq } from 'groq';

export async function fetchSanity(query, { params = {}, ...next } = {}) {
  const { isEnabled: isDraft } = await draftMode();
  const preview = isDev || isDraft;

  const options = preview
    ? {
        stega: isDraft,
        perspective: 'drafts',
        useCdn: false,
        token: process.env.SANITY_READ_TOKEN,
        next: { revalidate: 0, ...next }
      }
    : {
        perspective: 'published',
        useCdn: true,
        token: process.env.SANITY_READ_TOKEN,
        next: { revalidate: 3600, ...next }
      };

  return client.fetch(query, params, options);
}
