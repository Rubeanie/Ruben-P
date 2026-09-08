import { revalidateTag } from 'next/cache';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

// Every user tag sanityFetch is called with. Any publish marks them all stale: the
// site is small and edits are rare, so per-type mapping isn't worth its bugs.
const TAGS = [
  'site',
  'theme',
  'pages',
  'portfolios',
  'aboutPage',
  '404',
  'redirect-page'
];

// Sanity webhook target. Live updates only revalidate while a visitor has the
// site open; this keeps production fresh when nobody does.
export async function POST(request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret)
    return new Response('Revalidation is not configured', { status: 503 });

  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature || !(await isValidSignature(body, signature, secret)))
    return new Response('Invalid signature', { status: 401 });

  for (const tag of TAGS) revalidateTag(tag, 'max');
  return Response.json({ revalidated: TAGS, now: Date.now() });
}
