const CLOUDINARY_CHAIN = /\/image\/upload\/((?:[^/]+\/)*?)(v\d+\/)/;

// Sanity and Cloudinary resize and re-encode on their own CDNs, so those images skip
// Vercel's optimizer (and its per-transformation billing). Other hosts return null
// and keep the default loader.
export function cdnLoader({ src, width, quality }) {
  const url = new URL(src);

  if (url.hostname === 'cdn.sanity.io') {
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality || 75));
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
  } else if (url.hostname === 'res.cloudinary.com') {
    // Last transform before the version so earlier named or chained ones stay;
    // c_limit keeps a small original from being scaled up.
    url.pathname = url.pathname.replace(
      CLOUDINARY_CHAIN,
      `/image/upload/$1c_limit,f_auto,q_auto,w_${width}/$2`
    );
  } else {
    return null;
  }

  return url.toString();
}

export const hasCdnLoader = (src) => {
  try {
    const { hostname } = new URL(src);
    return hostname === 'cdn.sanity.io' || hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
};
