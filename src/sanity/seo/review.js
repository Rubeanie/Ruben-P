export const SANITY_DOWN =
  'Sanity is unavailable, so the check could not run. Try again in a moment.';

// The routes answer 502 for other failures too, so the body says which.
export const sanityDown = async (res) =>
  res.status === 502 &&
  (await res.json().catch(() => null))?.error === 'sanity unavailable';

// The members-only route; the Studio's own login token is what lets an editor in.
export async function askReview(token, body) {
  const res = await fetch('/api/studio/review', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    // The route gives the model 55 seconds; leaving early does not stop the bill.
    signal: AbortSignal.timeout(65_000)
  }).catch(() => null);
  if (!res) return { status: 0 };
  if (!res.ok) return { status: res.status, down: await sanityDown(res) };
  const data = await res.json().catch(() => null);
  return data ? { status: 200, data } : { status: 502 };
}

export const SIGNED_OUT = 'Sign out and back in to use the AI suggestions.';

// 503 is not a failure: the route has no key, so the AI step stays out of the way.
export function reviewProblem(status, down) {
  if (status === 401) return SIGNED_OUT;
  if (down) return SANITY_DOWN;
  if (status === 429)
    return 'That is a lot of checks; try again in a few minutes.';
  if (status === 413) return 'Too much text to check at once.';
  return 'The AI did not answer; try again in a moment.';
}
