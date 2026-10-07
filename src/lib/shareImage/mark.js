import sharp from 'sharp';

export const svgSrc = (svg) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

// The site logo in one ink, as the navbar draws it.
export const logoSrc = (svg, ink) =>
  svgSrc(
    svg
      .replace(/currentColor/g, ink)
      .replace(/fill="#[0-9a-f]{3,8}"/gi, `fill="${ink}"`)
  );

// Bounding box of the non-transparent pixels; right and bottom are exclusive.
async function inkBox(png) {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let [left, top, right, bottom] = [info.width, info.height, 0, 0];
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * info.channels + 3] > 24) {
        left = Math.min(left, x);
        right = Math.max(right, x + 1);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y + 1);
      }
  return { left, top, right, bottom };
}

const PROBE = 512;

// A platform logo keeps its own fills; only currentColor takes the ink. Sized by its ink, not its box:
// the square root of the inked area is `side`, so a wide wordmark and a round glyph read the same size.
export async function socialMark(svg, ink, side) {
  const vb = svg
    .match(/viewBox="([^"]+)"/)?.[1]
    .split(/[\s,]+/)
    .map(Number);
  const [w, h] = vb?.length === 4 ? [vb[2], vb[3]] : [1, 1];
  const k = PROBE / Math.max(w, h);
  const [pw, ph] = [Math.round(w * k), Math.round(h * k)];
  // The root's own width and height (often a square box around a wide viewBox) would letterbox
  // the glyph differently in sharp and Satori, so both draw it at the viewBox's aspect.
  const sized = svg
    .replace(/currentColor/g, ink)
    .replace(/<svg\b[^>]*>/, (tag) =>
      tag
        .replace(/\s(width|height)="[^"]*"/g, '')
        .replace(/^<svg/, `<svg width="${pw}" height="${ph}"`)
    );
  const src = svgSrc(sized);
  const png = await sharp(Buffer.from(sized)).png().toBuffer();
  const box = await inkBox(png);
  const scale =
    side / Math.sqrt((box.right - box.left) * (box.bottom - box.top));
  return {
    src,
    width: Math.round(pw * scale),
    height: Math.round(ph * scale),
    inkLeft: box.left * scale,
    inkTop: box.top * scale
  };
}
