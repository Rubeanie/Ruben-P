const CLOUDINARY_CHAIN = /\/image\/upload\/((?:[^/]+\/)*?)(v\d+\/)/;

function sanityLoader({ src, width, quality }) {
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality || 75));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');
  return url.toString();
}

// Last transform before the version so earlier named or chained ones stay;
// c_limit keeps a small original from being scaled up.
const cloudinaryLoader = ({ src, width }) =>
  src.replace(
    CLOUDINARY_CHAIN,
    `/image/upload/$1c_limit,f_auto,q_auto,w_${width}/$2`
  );

// Sanity and Cloudinary resize and re-encode on their own CDNs, so those images skip
// Vercel's optimizer (and its per-transformation billing). Anything else, an
// unversioned Cloudinary URL included, gets undefined and the default optimizer.
export function loaderFor(src) {
  if (typeof src !== 'string') return undefined;
  if (src.startsWith('https://cdn.sanity.io/')) return sanityLoader;
  if (
    src.startsWith('https://res.cloudinary.com/') &&
    CLOUDINARY_CHAIN.test(src)
  )
    return cloudinaryLoader;
}
