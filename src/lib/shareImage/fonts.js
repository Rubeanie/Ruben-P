import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Satori takes static TrueType faces only, so these are instances of the site's fonts.
const FACES = {
  mont: ['Mont', 700, 'trt/trt-mont-broz-bold.ttf'],
  figtree: ['Figtree', 400, 'figtree/figtree-400.ttf'],
  figtreeSemiBold: ['Figtree', 600, 'figtree/figtree-600.ttf']
};

const files = {};
const read = (file) =>
  (files[file] ??= readFile(join(process.cwd(), 'src/styles/fonts', file)));

export const loadFonts = () =>
  Promise.all(
    Object.values(FACES).map(async ([name, weight, file]) => ({
      name,
      weight,
      style: 'normal',
      data: await read(file)
    }))
  );

// Advance widths from the font's hmtx and format 4 cmap, so a line can be sized before Satori lays it out,
// plus the vertical metrics Satori places a line by (hhea) and the cap height.
function parse(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const tables = {};
  for (let i = 0; i < dv.getUint16(4); i++) {
    const o = 12 + i * 16;
    const tag = String.fromCharCode(
      ...[0, 1, 2, 3].map((k) => dv.getUint8(o + k))
    );
    tables[tag] = dv.getUint32(o + 8);
  }
  const upem = dv.getUint16(tables.head + 18);
  const metrics = dv.getUint16(tables.hhea + 34);
  let format4;
  for (let i = 0; i < dv.getUint16(tables.cmap + 2); i++) {
    const off = dv.getUint32(tables.cmap + 4 + i * 8 + 4);
    if (dv.getUint16(tables.cmap + off) === 4) format4 = tables.cmap + off;
  }
  const segments = dv.getUint16(format4 + 6);
  const ends = format4 + 14;
  const starts = ends + segments + 2;
  const deltas = starts + segments;
  const ranges = deltas + segments;
  const glyph = (c) => {
    for (let i = 0; i < segments; i += 2) {
      if (c > dv.getUint16(ends + i)) continue;
      const start = dv.getUint16(starts + i);
      if (c < start) return 0;
      const delta = dv.getInt16(deltas + i);
      const range = dv.getUint16(ranges + i);
      if (!range) return (c + delta) & 0xffff;
      const g = dv.getUint16(ranges + i + range + 2 * (c - start));
      return g ? (g + delta) & 0xffff : 0;
    }
    return 0;
  };
  const advance = (g) =>
    dv.getUint16(tables.hmtx + 4 * Math.min(g, metrics - 1));
  const width = (text) =>
    [...text].reduce((w, ch) => w + advance(glyph(ch.codePointAt(0))), 0) /
    upem;
  return {
    width,
    ascender: dv.getInt16(tables.hhea + 4) / upem,
    descender: dv.getInt16(tables.hhea + 6) / upem,
    capHeight: dv.getInt16(tables['OS/2'] + 88) / upem
  };
}

const faces = {};
export const face = (name) =>
  (faces[name] ??= read(FACES[name][2]).then(parse));
