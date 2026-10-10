import { useEffect, useState } from 'react';
import { sanitizeSvg } from '@/lib/sanitizeSvg';

// Callers on one client share a request; it is dropped soon after it settles,
// so the next mount sees a logo edit and a failure retries.
const TTL = 5000;
const requests = new Map();
const fetchLogo = (client) => {
  if (!requests.has(client)) {
    const request = client
      .fetch(`*[_type == 'site'][0].logo`, {}, { perspective: 'drafts' })
      .then((svg) => sanitizeSvg(svg) || null);
    requests.set(client, request);
    request
      .catch(() => {})
      .finally(() => setTimeout(() => requests.delete(client), TTL));
  }
  return requests.get(client);
};

// The datasets are private, so only the Studio's own client can read the logo.
export function useSiteLogo(client) {
  const [logo, setLogo] = useState(null);
  useEffect(() => {
    if (!client) return;
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
