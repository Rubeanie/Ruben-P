import client from '@/lib/sanity/client';
import { isDev } from '@/lib/env';
import { draftMode } from 'next/headers';

export { default as groq } from 'groq';

export function fetchSanity(query, { params = {}, ...next } = {}) {
  const preview = isDev || draftMode().isEnabled;

  const options = preview
    ? {
        stega: true,
        perspective: 'previewDrafts',
        useCdn: false,
        token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
        next: { revalidate: 0, ...next }
      }
    : {
        perspective: 'published',
        useCdn: true,
        token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
        next: { revalidate: 3600, ...next }
      };

  return client.fetch(query, params, options);
}