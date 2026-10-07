import { createHash } from 'node:crypto';
import { projectId } from '@/lib/env';

const EDIT_ROLES = ['administrator', 'developer', 'editor', 'contributor'];
const TOKEN_TTL = 60_000;
const MAX_CACHED = 500;
// Checks of different tokens waiting on Sanity at once; past this, new ones
// are refused.
const MAX_PENDING = 20;

// What memberOf answers when too many checks are already in flight.
export const BUSY = Symbol('busy');

export const json = (body, status = 200) => Response.json(body, { status });

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// The caller's address as the platform reports it, for throttling strangers.
export const ipOf = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  request.headers.get('x-real-ip') ||
  'unknown';

// True once a key has made `limit` calls inside `window`. The counts live in
// memory, so each server instance keeps its own. A key still inside its window
// is never forgotten: when the table is full of them, new keys are refused.
export function createRateLimit({ limit, window, now = Date.now }) {
  const hits = new Map();
  return function overLimit(key) {
    const since = now() - window;
    if (!hits.has(key) && hits.size >= MAX_CACHED) {
      for (const [old, times] of hits)
        if (!times.some((t) => t > since)) hits.delete(old);
      if (hits.size >= MAX_CACHED) return true;
    }
    const recent = (hits.get(key) ?? []).filter((t) => t > since);
    const over = recent.length >= limit;
    if (!over) recent.push(now());
    hits.set(key, recent);
    return over;
  };
}

// Who is asking, as a Sanity user id, null, or BUSY. Only someone who can edit this
// project passes. A viewer is turned away: that includes the site's read
// token, which preview sessions hand the browser. `fresh` asks Sanity every
// time, so a revoked member is out at once.
export function createMemberCheck({
  fetch: fetcher = (...args) => fetch(...args),
  now = Date.now,
  fresh = false
} = {}) {
  const verified = new Map();
  // Concurrent checks of one token share a single call to Sanity.
  const pending = new Map();

  async function ask(token) {
    const res = await fetcher(
      `https://${projectId}.api.sanity.io/v2021-06-07/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000)
      }
    ).catch(() => null);
    if (res?.status !== 200) return null;
    const me = await res.json().catch(() => null);
    const canEdit =
      Array.isArray(me?.roles) &&
      me.roles.some((role) => EDIT_ROLES.includes(role?.name));
    // Robot tokens never pass, whatever their role: only a person signed in.
    const robot = me?.provider === 'sanity-token';
    return typeof me?.id === 'string' && canEdit && !robot ? me.id : null;
  }

  async function userOf(token) {
    const hash = hashToken(token);
    const cached = !fresh && verified.get(hash);
    if (cached && cached.expires > now()) return cached.id;
    verified.delete(hash);

    if (!pending.has(hash)) {
      if (pending.size >= MAX_PENDING) return BUSY;
      pending.set(
        hash,
        ask(token).finally(() => pending.delete(hash))
      );
    }
    const id = await pending.get(hash);
    if (id && !fresh) {
      if (verified.size >= MAX_CACHED)
        verified.delete(verified.keys().next().value);
      verified.set(hash, { id, expires: now() + TOKEN_TTL });
    }
    return id;
  }

  return async function memberOf(request) {
    const token = request.headers
      .get('authorization')
      ?.match(/^Bearer\s+(\S+)$/i)?.[1];
    return (token && (await userOf(token))) || null;
  };
}
