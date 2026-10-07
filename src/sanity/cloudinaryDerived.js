import {
  EXTENSION,
  clipSettings,
  cloudinaryTransform,
  isClip
} from '@/lib/imageLoader';

// The asset's own URL, as ClipInput reads it.
export const assetUrl = (asset) =>
  asset?.derived?.[0]?.secure_url || asset?.secure_url;

// A rendition of the asset's still: an image as it is, a video at the clip's
// Start. The extension swap wins over any f_ in the transform.
function rendition(url, clip, transform, ext) {
  const cut = isClip(url)
    ? `so_${clipSettings(clip).start},${transform}`
    : transform;
  return cloudinaryTransform(url, cut).replace(EXTENSION, `.${ext}$1`);
}

// fl_getinfo needs its own step after the crop. A wide crop settles the
// subject's vertical centre, a tall one its horizontal centre.
const crop = (ratio) => `c_fill,ar_${ratio},g_auto/fl_getinfo`;

const round = (n) => Math.round(n * 1000) / 1000;

// Where Cloudinary's chosen crop sits in the source, 0-1, along one axis.
function centreOf(info, axis) {
  const box = info?.g_auto_info?.[0];
  const size = axis === 'x' ? info?.input?.width : info?.input?.height;
  if (!box || !size) throw new Error('Cloudinary found no focal point');
  const [from, length] =
    axis === 'x' ? [box.x, box.width] : [box.y, box.height];
  return Math.min(1, Math.max(0, round((from + length / 2) / size)));
}

async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.json();
}

export async function readFocus(url, clip) {
  const [x, y] = await Promise.all([
    json(rendition(url, clip, crop('1:4'), 'webp')),
    json(rendition(url, clip, crop('4:1'), 'webp'))
  ]);
  return { x: centreOf(x, 'x'), y: centreOf(y, 'y') };
}

export async function readLqip(url, clip) {
  const response = await fetch(
    rendition(url, clip, 'w_20,f_webp,q_70', 'webp')
  );
  if (!response.ok) throw new Error(`${response.status} for the placeholder`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  return `data:image/webp;base64,${btoa(String.fromCharCode(...bytes))}`;
}

const VIBRANT = ['Vibrant', 'LightVibrant', 'DarkVibrant', 'Muted'];

// Vibrant is the Vibrant swatch, falling back through the others; dominant is
// whichever swatch covers the most pixels.
function paletteFrom(palette) {
  const swatches = Object.values(palette).filter(Boolean);
  if (!swatches.length) return null;
  const background = (swatch) => ({ background: swatch.hex.toLowerCase() });
  const vibrant =
    VIBRANT.map((name) => palette[name]).find(Boolean) ?? swatches[0];
  const dominant = swatches.reduce((a, b) =>
    b.population > a.population ? b : a
  );
  return { dominant: background(dominant), vibrant: background(vibrant) };
}

export async function readPalette(url, clip) {
  const { Vibrant } = await import('node-vibrant/browser');
  const palette = await Vibrant.from(
    rendition(url, clip, 'w_200,f_webp,q_70', 'webp')
  ).getPalette();
  return paletteFrom(palette);
}
