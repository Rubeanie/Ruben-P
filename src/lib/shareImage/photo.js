import sharp from 'sharp';
import { baseUrl } from '@/lib/env';
import { stillOf } from '@/lib/imageBlock';
import { cloudinaryTransform } from '@/lib/imageLoader';
import { luminance, shadeFor } from './colours';
import { seeded } from './rings';
import { W, H } from './layout';

export const jpegSrc = (buf) =>
  `data:image/jpeg;base64,${buf.toString('base64')}`;

// The still is cut to the card around its subject (g_auto, which a Media
// Library focal point steers); a video's still is a WebP already.
const CARD = `c_fill,g_auto,w_${W},h_${H},q_85`;
const cardCrop = (image) => cloudinaryTransform(stillOf(image), CARD);

// The CDN won't upscale a small image, so it is brought to size here. Null when the photo
// can't be fetched or decoded.
export async function loadPhoto(image) {
  try {
    // Strict transformations cut the new card crop only for the site's Referer.
    const res = await fetch(cardCrop(image), { headers: { Referer: baseUrl } });
    if (!res.ok) throw new Error(`CDN answered ${res.status}`);
    return await sharp(Buffer.from(await res.arrayBuffer()))
      .flatten({ background: '#ffffff' })
      .resize(W, H, { fit: 'cover' })
      .jpeg({ quality: 92 })
      .toBuffer();
  } catch (error) {
    console.error(`Share card photo failed: ${stillOf(image)}`, error);
    return null;
  }
}

// The 80th-percentile-bright pixel under each line, so a bright patch counts and not just the average;
// the block's shade is the strongest any of its lines needs for its own ink opacity and target.
export async function blockShades(photo, blocks, ground, ink) {
  const { data } = await sharp(photo)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bright = ({ x, y, w, h }) => {
    const px = [];
    for (let j = Math.max(0, Math.round(y)); j < Math.min(H, y + h); j++)
      for (let i = Math.max(0, Math.round(x)); i < Math.min(W, x + w); i++) {
        const k = (j * W + i) * 3;
        px.push([data[k], data[k + 1], data[k + 2]]);
      }
    const lum = px.map(luminance);
    const order = lum.map((_, i) => i).sort((a, b) => lum[a] - lum[b]);
    return px[order[Math.floor(order.length * 0.8)]];
  };
  return blocks.map((lines) =>
    Math.max(
      0,
      ...lines
        .filter((line) => line.w >= 1 && line.h >= 1)
        .map((line) => shadeFor(bright(line), ground, ink, line))
    )
  );
}

// The no-image ground: seeded soft blobs in the theme colours.
export async function blobGround(theme, id) {
  const rand = seeded(`${id}:ground`);
  const blob = (color, r) =>
    `<circle cx="${Math.round(rand() * W)}" cy="${Math.round(rand() * H)}" r="${r}" fill="${color}" fill-opacity="${(0.45 + rand() * 0.45).toFixed(2)}"/>`;
  const blobs = [
    blob(theme.primary, 260 + rand() * 120),
    blob(theme.secondary, 320 + rand() * 160),
    blob(theme.primary, 140 + rand() * 90),
    blob(theme.text, 90 + rand() * 60),
    blob(theme.secondary, 200 + rand() * 100)
  ].join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter></defs><rect width="${W}" height="${H}" fill="${theme.background}"/><g filter="url(#b)">${blobs}</g></svg>`;
  return jpegSrc(
    await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
  );
}
