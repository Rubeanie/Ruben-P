import { stegaClean } from '@sanity/client/stega';
import { anchors, decodeFragment } from '@/lib/anchors';
import { firstRow, tileSizes } from '@/lib/bento';
import { heroPhotos } from '@/lib/heroPhotos';
import { carouselSizes } from '@/lib/carousel';
import { renderable } from '@/lib/carouselItems';
import {
  CREATIVE_SIZES,
  PROSE_SIZES,
  resolveAsset,
  SCENE_POSTER_SIZES,
  sizedSizes
} from '@/lib/imageBlock';
import { isAnimated, stillFrame } from '@/lib/imageLoader';
import { drawnModules } from '@/lib/modules';
import { featuredFirst } from '@/lib/posts';
import { isInternalHref, resolveLink } from '@/lib/processUrl';
import { isPagePath } from '@/lib/slug';
import uid from '@/lib/uid';
import { getYouTubeId } from '@/lib/youtube';

// A visitor sees about two modules with pictures before scrolling. Modules
// without any don't count towards them, but the search looks this many modules
// down at most, so a long page never preloads what sits screens away.
const MODULES = 2;
const SEARCH_DEPTH = 5;
const LIMIT = 4;
// A block list's opening, roughly a screen of prose.
const BLOCKS = 6;
// Per module, so a long article doesn't spend the budget on its fourth figure.
const PER_MODULE = 2;

// "/about#team" as { path, hash }; null for anything that isn't a site page.
export function splitHref(href) {
  const clean = stegaClean(href);
  if (!isInternalHref(clean)) return null;
  const { pathname, hash } = new URL(clean, 'http://x');
  return isPagePath(pathname)
    ? { path: pathname, hash: hash.length > 1 ? hash : '' }
    : null;
}

// Thin chrome that never holds media: the contents sit beside the page (a bar
// on phones) and breadcrumbs are one line, so neither uses up the opening.
const CHROME = new Set(['table-of-contents', 'breadcrumbs']);

// The modules a link lands on: the opening ones, or, for a link to a heading
// or module, the one holding it and the next. `matched` says the anchor exists.
export function viewModules(modules, hash) {
  const drawn = drawnModules(modules).filter(
    (module) => !CHROME.has(stegaClean(module._type))
  );
  const id = hash && decodeFragment(hash.slice(1));
  if (id) {
    const heading = anchors(modules).headings.find((h) => h.id === id);
    const target =
      heading?.moduleId ??
      modules?.map(uid).find((moduleId) => moduleId === id);
    const at = drawn.findIndex((module) => uid(module) === target);
    if (at >= 0)
      return { modules: drawn.slice(at, at + SEARCH_DEPTH), matched: true };
  }
  return { modules: drawn.slice(0, SEARCH_DEPTH), matched: false };
}

const blockSizes = (sizes, block) => sizedSizes(sizes, stegaClean(block.size));

// A clip that plays as video shows its first frame until it plays, and that
// frame is what to warm; the video itself is left to the page.
const imagePick = (block, sizes) => {
  const asset = resolveAsset(block);
  if (!asset) return null;
  const { src, clip } = asset;
  return {
    kind: 'image',
    src: clip?.video ? stillFrame(src, clip) : src,
    sizes
  };
};

const heroPicks = (module) =>
  heroPhotos(module)
    .map(({ image, sizes, media }) => {
      const src = stegaClean(image?.asset?.url);
      return src && { kind: 'image', src, sizes, media };
    })
    .filter(Boolean);

// Images and posters of a block list, as RichText renders them.
const contentPicks = (content) =>
  (content ?? [])
    .slice(0, BLOCKS)
    .map((block) => {
      if (stegaClean(block._type) === 'imageBlock')
        return imagePick(block, blockSizes(PROSE_SIZES, block));
      if (stegaClean(block._type) !== 'youtube') return null;
      // An autoplaying one is a bare iframe, nothing to warm.
      const id = stegaClean(block.autoplay)
        ? null
        : getYouTubeId(stegaClean(block.url));
      return id && { kind: 'youtube', id };
    })
    .filter(Boolean)
    .slice(0, PER_MODULE);

// The carousel's front card, its first item it can draw; the rest wait behind.
function carouselPicks(module, { railed }) {
  const shown = (module.items ?? []).filter(renderable);
  const item = shown[0];
  const sizes = carouselSizes(
    shown.length,
    module.loop,
    railed.has(module),
    stegaClean(module.size)
  );
  switch (stegaClean(item?._type)) {
    case 'carouselImage':
      return [imagePick(item, sizes)];
    case 'carouselYouTube':
      return [
        { kind: 'youtube', id: getYouTubeId(stegaClean(item.url)), sizes }
      ];
    case 'carouselScene': {
      const src = stegaClean(item.poster);
      return src
        ? [
            {
              kind: 'image',
              src,
              sizes: sizedSizes(SCENE_POSTER_SIZES, stegaClean(module.size))
            }
          ]
        : [];
    }
    default:
      return [];
  }
}

const tileCovers = (rows) =>
  rows
    .filter(({ post }) => post.cover?.asset?.url)
    .map(({ post, shape, mobileShape, wide }) => ({
      kind: 'cover',
      cover: stegaClean(post.cover),
      sizes: tileSizes({ shape, mobileShape, wide })
    }));

// One selection per module type that draws a picture, in page order: { kind:
// 'image', src, sizes, media } | { kind: 'cover', cover, sizes } | { kind:
// 'youtube', id } | { kind: 'model' }. A new image module adds a line here.
const PICKS = {
  hero: heroPicks,
  'hero.split': heroPicks,
  'hero.saas': heroPicks,
  'hero.3d': () => [{ kind: 'model' }],
  'richtext-module': (module) => contentPicks(module.content),
  callout: (module) => contentPicks(module.content),
  'creative-module': (module) =>
    (module.columns ?? [])
      .flatMap((column) => column.blocks ?? [])
      .flatMap((block) => {
        switch (stegaClean(block._type)) {
          case 'imageBlock':
            return imagePick(block, blockSizes(CREATIVE_SIZES, block)) ?? [];
          case 'copy':
            return contentPicks(block.content);
          default:
            return [];
        }
      })
      .slice(0, PER_MODULE),
  // The click-to-load scene's poster; a live scene has none.
  'three.js': (module) => {
    const src = stegaClean(module.poster);
    return module.loadOnClick && src
      ? [
          {
            kind: 'image',
            src,
            sizes: sizedSizes(SCENE_POSTER_SIZES, stegaClean(module.size))
          }
        ]
      : [];
  },
  'media-carousel': carouselPicks,
  'post-list': (module, { posts }) => tileCovers(firstRow(posts)),
  // Under a post the row is its related posts, which need the post itself.
  'post-featured': (module, { posts, onPost }) =>
    onPost
      ? []
      : tileCovers(
          featuredFirst(posts)
            .slice(0, module.limit)
            .map((post) => ({ post, wide: true }))
        )
};

const pickKey = (pick) =>
  pick.kind === 'cover'
    ? pick.cover.asset.url
    : (pick.src ?? pick.id ?? pick.kind);

// What a link's destination shows first, in order of appearance, capped.
// `posts` is the post index, for modules of tiles; `onPost` says the page is
// a post; `railed` holds the modules beside a table of contents' rail.
export function picks(
  modules,
  { posts = [], onPost = false, railed = new Set() } = {}
) {
  const seen = new Set();
  return modules
    .map((module) =>
      (PICKS[module._type]?.(module, { posts, onPost, railed }) ?? [])
        // Animations run to megabytes: too much to fetch on a hover.
        .filter((pick) => !isAnimated(pickKey(pick)))
    )
    .filter((found) => found.length)
    .slice(0, MODULES)
    .flat()
    .filter((pick) => {
      const key = `${pick.kind}:${pickKey(pick)}:${pick.sizes}`;
      return !seen.has(key) && seen.add(key);
    })
    .slice(0, LIMIT);
}

// Every internal page link in a module tree (CTAs, link blocks, rich-text link
// marks) as "/path" or "/path#hash", other than ones that stay on `current`.
export function pageHrefs(modules, current) {
  const found = new Set();
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    const href =
      stegaClean(node._type) === 'link' && typeof node.href === 'string'
        ? node.href
        : resolveLink(node);
    const target = splitHref(href);
    if (target && target.path !== current) found.add(target.path + target.hash);
    Object.values(node).forEach(visit);
  };
  visit(modules);
  return [...found];
}
