import { useEffect, useState } from 'react';
import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '@/lib/env';
import { sanitizeSvg } from '@/lib/sanitizeSvg';

// The navbar draws the logo on the login screen too, before the Studio's
// client exists, so it reads the published logo signed out. Form inputs pass
// the Studio's client and see the draft.
const signedOut = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false
});

// Callers on one client share a request; it is dropped soon after it settles,
// so the next mount sees a logo edit and a failure retries.
const TTL = 5000;
const requests = new Map();
const fetchLogo = (client) => {
  if (!requests.has(client)) {
    const request = client
      .fetch(
        `*[_type == 'site'][0].logo`,
        {},
        { perspective: client === signedOut ? 'published' : 'drafts' }
      )
      .then((svg) => sanitizeSvg(svg) || null);
    requests.set(client, request);
    request
      .catch(() => {})
      .finally(() => setTimeout(() => requests.delete(client), TTL));
  }
  return requests.get(client);
};

export function useSiteLogo(client = signedOut) {
  const [logo, setLogo] = useState(null);
  useEffect(() => {
    let live = true;
    fetchLogo(client)
      .then((svg) => live && setLogo(svg))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [client]);
  return logo;
}
