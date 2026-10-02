'use client';

import { useEffect } from 'react';

// Registers /sw.js in production. In development it removes one left behind by
// a local production run: dev chunk URLs are not content-hashed, so its
// cache-first rule would keep serving stale code.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    } else {
      navigator.serviceWorker
        .getRegistrations()
        .then((all) => all.forEach((sw) => sw.unregister()));
    }
  }, []);
  return null;
}
