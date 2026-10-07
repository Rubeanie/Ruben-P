import { getImageProps } from 'next/image';
import { stegaClean } from '@sanity/client/stega';
import { MODEL } from '@/lib/hero3d';
import { fetchSanity } from '@/lib/sanity/fetch';
import { getPostIndex } from '@/lib/sanity/queries/posts';
import { introImagesQuery } from '@/lib/sanity/queries/intro-images';
import { loaderFor } from '@/lib/imageLoader';
import { picks, splitHref, viewModules } from '@/lib/introPicks';
import { railedModules } from '@/lib/toc';
import { resolveLink } from '@/lib/processUrl';
import { PROSE_SIZES } from '@/lib/imageBlock';
import { getThumb } from '@/lib/youtube';

// Internal page links of menus, for the links whose destination gets preloaded.
export function menuHrefs(...menus) {
  const links = menus.flatMap((menu) => [
    menu?.leadLink,
    ...(menu?.items ?? []),
    menu?.cta
  ]);
  return links.map((link) => resolveLink(link)).filter(splitHref);
}

// The srcSet as one URL with a {w} slot plus its widths, which the browser
// expands again: a few hundred bytes instead of a kilobyte per picture. Null
// when the URLs don't follow one pattern.
function compact(srcSet) {
  const entries = srcSet.split(', ').map((entry) => entry.split(' '));
  const widths = entries.map(([, width]) => parseInt(width));
  const template = entries[0][0].replace(
    new RegExp(`([?&]w=|,w_)${widths[0]}(?=[&/]|$)`),
    '$1{w}'
  );
  const exact = entries.every(
    ([url], i) => template.replace('{w}', widths[i]) === url
  );
  return exact && widths.every(Number.isInteger) ? { template, widths } : null;
}

// A pick as the destination renders it (same loader, sizes and widths, so a
// preload and the page share one cache entry): { as, href, srcSet | template
// and widths, sizes, media, crossOrigin }.
function image({ src, sizes, media, loader }) {
  const { props } = getImageProps({ src, alt: '', fill: true, sizes, loader });
  const { srcSet } = props;
  return {
    as: 'image',
    ...(compact(srcSet) ?? { href: props.src, srcSet }),
    sizes,
    media
  };
}

async function preloadFor(pick) {
  switch (pick.kind) {
    case 'image':
      return image({ ...pick, loader: loaderFor(pick.src) });
    case 'youtube':
      return image({
        src: await getThumb(pick.id),
        sizes: pick.sizes ?? PROSE_SIZES
      });
    case 'model':
      return { as: 'fetch', href: MODEL, crossOrigin: 'anonymous' };
  }
}

let logged = false;

// href ("/path" or "/path#heading") -> what the page that links there shows
// first: { preloads: [...], warm3d }. A hash that names a heading or module
// gets its own entry; any other link uses its page's opening. Preloads are a
// nicety, so a failure leaves them out instead of failing the page.
export async function introImages(hrefs) {
  try {
    return await destinations(hrefs);
  } catch (error) {
    if (!logged) console.error('Link preloads skipped:', error);
    logged = true;
    return {};
  }
}

async function destinations(hrefs) {
  const targets = [...new Set(hrefs.map((href) => splitHref(href)?.path))]
    .filter(Boolean)
    .sort();
  if (!targets.length) return {};
  const pages = await fetchSanity(introImagesQuery, {
    params: { paths: targets },
    tags: ['pages', 'posts']
  });
  const byPath = new Map(
    (pages ?? []).map((page) => [stegaClean(page.path), page])
  );

  // Only a destination that opens with tiles needs the post index.
  let index;
  const postList = async () => (await (index ??= getPostIndex())).posts;

  const result = {};
  await Promise.all(
    [...new Set(hrefs)].map(async (href) => {
      const { path, hash } = splitHref(href) ?? {};
      if (!byPath.has(path)) return;
      const page = byPath.get(path);
      const { modules, matched } = viewModules(page.modules, hash);
      const key = matched ? path + hash : path;
      if (key in result) return;
      result[key] = null;
      const tiles = modules.some((module) => module._type.startsWith('post-'));
      const chosen = picks(modules, {
        posts: tiles ? await postList() : [],
        onPost: page.onPost,
        railed: railedModules(page.modules)
      });
      if (chosen.length)
        result[key] = {
          preloads: await Promise.all(chosen.map(preloadFor)),
          ...(chosen.some((pick) => pick.kind === 'model') && { warm3d: true })
        };
    })
  );
  return Object.fromEntries(Object.entries(result).filter(([, v]) => v));
}
