import { revalidateTag } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';
import { decodeSignatureHeader, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

// Every tag a Sanity fetch is called with. Any publish marks them all stale: the
// site is small and edits are rare, so per-type mapping isn't worth its bugs.
const TAGS = [
  'site',
  'theme',
  'pages',
  'posts',
  'authors',
  '404',
  'redirect-page',
  'redirects',
  'socials'
];

// Sanity webhook target: how a publish reaches the public site (live updates
// run only in draft mode).
export async function POST(request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret)
    return new Response('Revalidation is not configured', { status: 503 });

  // Also waits out Sanity's CDN invalidation so the regeneration reads fresh data.
  // parseBody reads the body as JSON even when the signature is wrong, so junk
  // from a stranger is refused here rather than thrown as a 500.
  const { isValidSignature } = await parseBody(request, secret).catch(() => ({
    isValidSignature: false
  }));
  if (!isValidSignature)
    return new Response('Invalid signature', { status: 401 });

  // A signature never expires on its own, so refuse replays of old deliveries.
  const { timestamp } = decodeSignatureHeader(
    request.headers.get(SIGNATURE_HEADER_NAME)
  );
  if (Math.abs(Date.now() - timestamp) > 5 * 60_000)
    return new Response('Stale signature', { status: 401 });

  for (const tag of TAGS) revalidateTag(tag, 'max');
  return Response.json({ revalidated: TAGS, now: Date.now() });
}
