import { createHash } from 'node:crypto';
import { folderFor } from '@/lib/cloudinaryFolder';
import {
  BUSY,
  createMemberCheck,
  createRateLimit,
  ipOf,
  json
} from '@/lib/studioMember';
import { RATE_LIMIT, RATE_WINDOW } from '@/lib/studioReview';

// The cloud every res.cloudinary.com URL on the site points at; public anyway.
const CLOUD_NAME = 'ruben-p';
const MAX_BODY = 1024;

const PAGE_EXISTS = `count(*[_type in ['page', 'page.post'] && metadata.slug.current == $path]) > 0`;

// Drafts count: a page being written has its slug before it is published.
async function pageExists(path) {
  const { default: client } = await import('@/lib/sanity/client');
  return client.fetch(
    PAGE_EXISTS,
    { path },
    { perspective: 'raw', useCdn: false, cache: 'no-store' }
  );
}

// Cloudinary's documented recipe: every signed param as k=v, sorted by name,
// joined with &, the secret appended, SHA-1 in hex. file, api_key,
// resource_type and cloud_name are never part of it.
export function signParams(params, secret) {
  const serial = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1')
    .update(serial + secret)
    .digest('hex');
}

// Signs one Studio upload for a page that exists. The editor names the page and
// the scene; the folder, file name and formats are fixed here and covered by
// the signature. Each scene has one poster, so a new one replaces the old in
// place (a new version, so a new URL) instead of piling up beside it.
// Accepted, since only project editors can sign: Cloudinary can't sign the
// endpoint's resource type (allowed_formats still applies) or the file itself,
// so a member could post a different allowed image under the poster's name,
// and a signature stays good for Cloudinary's fixed hour.
export function createSignHandler({
  fetch: fetcher = (...args) => fetch(...args),
  env = process.env,
  now = Date.now,
  exists = pageExists
} = {}) {
  const memberOf = createMemberCheck({ fetch: fetcher, now, fresh: true });
  const limit = { limit: RATE_LIMIT, window: RATE_WINDOW, now };
  // Strangers are slowed before their token costs a call to Sanity.
  const ipOverLimit = createRateLimit(limit);
  const memberOverLimit = createRateLimit(limit);

  return async function POST(request) {
    if (ipOverLimit(ipOf(request)))
      return json({ error: 'too many requests' }, 429);
    const user = await memberOf(request);
    if (!user) return json({ error: 'unauthorised' }, 401);
    if (user === BUSY || memberOverLimit(user))
      return json({ error: 'too many requests' }, 429);

    const apiKey = env.CLOUDINARY_API_KEY;
    const secret = env.CLOUDINARY_API_SECRET;
    if (!apiKey || !secret) return json({ error: 'not configured' }, 500);

    const raw = await request.text().catch(() => null);
    if (raw === null) return json({ error: 'bad request' }, 400);
    if (Buffer.byteLength(raw) > MAX_BODY)
      return json({ error: 'too large' }, 413);
    let path, scene;
    try {
      ({ path, scene } = JSON.parse(raw) ?? {});
    } catch {
      return json({ error: 'bad request' }, 400);
    }
    const folder = folderFor(path);
    // A Sanity array key, which names the poster's file.
    if (typeof scene !== 'string' || !/^[\w-]{1,64}$/.test(scene))
      return json({ error: 'bad request' }, 400);
    if (!folder || !(await exists(path).catch(() => false)))
      return json({ error: 'bad request' }, 400);

    const params = {
      allowed_formats: 'avif,jpg,png,webp',
      folder,
      overwrite: true,
      public_id: `3d-poster-${scene}`,
      timestamp: Math.floor(now() / 1000)
    };
    return json({
      cloudName: CLOUD_NAME,
      apiKey,
      params,
      signature: signParams(params, secret)
    });
  };
}
