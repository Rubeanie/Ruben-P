import { baseUrl } from '@/lib/env';
import {
  BUSY,
  createMemberCheck,
  createRateLimit,
  ipOf,
  json
} from '@/lib/studioMember';
import { RATE_LIMIT, RATE_WINDOW } from '@/lib/studioReview';

const PAGESPEED = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const MAX_BODY = 2048;

// Lighthouse's SEO score and the audits it failed, minus the ones it can't judge.
export function psiSummary(data) {
  const lighthouse = data?.lighthouseResult;
  const category = lighthouse?.categories?.seo;
  if (!category) return null;
  const failing = category.auditRefs
    .map((ref) => lighthouse.audits?.[ref.id])
    .filter(
      (audit) =>
        audit &&
        audit.score !== null &&
        audit.score < 1 &&
        !['manual', 'notApplicable'].includes(audit.scoreDisplayMode)
    )
    .map((audit) => audit.title);
  return { score: Math.round(category.score * 100), failing };
}

// Runs Google's live SEO check of one of the site's own pages for signed-in
// Studio members. The key stays on the server, so nobody else can spend its quota.
export function createPageSpeedHandler({
  fetch: fetcher = (...args) => fetch(...args),
  env = process.env,
  now = Date.now,
  site = baseUrl
} = {}) {
  const memberOf = createMemberCheck({ fetch: fetcher, now });
  const limit = { limit: RATE_LIMIT, window: RATE_WINDOW, now };
  // Strangers are slowed before their token costs a call to Sanity.
  const ipOverLimit = createRateLimit(limit);
  const overLimit = createRateLimit(limit);

  return async function POST(request) {
    if (ipOverLimit(ipOf(request)))
      return json({ error: 'too many requests' }, 429);
    const user = await memberOf(request);
    if (!user) return json({ error: 'unauthorised' }, 401);
    if (user === BUSY || overLimit(user))
      return json({ error: 'too many requests' }, 429);

    const raw = await request.text().catch(() => null);
    if (raw === null || Buffer.byteLength(raw) > MAX_BODY)
      return json({ error: 'bad request' }, 400);
    let url;
    try {
      url = new URL(JSON.parse(raw)?.url);
    } catch {
      return json({ error: 'bad request' }, 400);
    }
    // Only the site's own pages.
    if (url.origin !== new URL(site).origin)
      return json({ error: 'not this site' }, 400);

    const key = env.PAGESPEED_API_KEY;
    const query = new URLSearchParams({
      url: url.href,
      category: 'seo',
      strategy: 'mobile',
      ...(key && { key })
    });
    // Lighthouse takes 10 to 30 seconds; this stops short of the route's own limit.
    const res = await fetcher(`${PAGESPEED}?${query}`, {
      cache: 'no-store',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(50_000)])
    }).catch(() => null);
    if (res?.status === 429) return json({ error: 'quota' }, 503);
    // Retrying never fixes a key Google turns away.
    if (res?.status === 400 || res?.status === 403)
      return json({ error: 'key' }, 500);
    const result = res?.ok && psiSummary(await res.json().catch(() => null));
    return result ? json(result) : json({ error: 'no result' }, 502);
  };
}
