import { isPagePath } from '@/lib/slug';
import { getShareCard } from '@/lib/shareImage/data';
import { renderShareImage } from '@/lib/shareImage/render';

// Drawn on the first request for a path, then kept until a publish revalidates the tags it read.
// An opengraph-image file can't sit under the optional catch-all page route.
export const dynamic = 'force-static';

export async function GET(request, { params }) {
  const { path: segments } = await params;
  const path = '/' + (segments ?? []).join('/');
  const card = isPagePath(path) ? await getShareCard(path) : null;
  if (!card) return new Response('Not found', { status: 404 });
  return new Response(await renderShareImage(card), {
    headers: { 'content-type': 'image/jpeg' }
  });
}
