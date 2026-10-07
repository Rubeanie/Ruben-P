import { W, H } from './layout';

// A stable stream of numbers per page id, so a page keeps its rings between renders.
export function seeded(id) {
  let h = 2166136261;
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Out from the logo past the far corner, 30 to 80 px apart.
export function ringRadii(id) {
  const rand = seeded(id);
  const radii = [];
  for (let r = 60; r < 1400; r += 30 + rand() * 50) radii.push(r);
  return radii;
}

export const BOLD_RING = 2;

// Hairlines brighter on their top edge, fading with distance, over a soft glow.
export function hairlinesSvg({ cx, cy, radii, glow, glowAlpha, strength }) {
  const circles = radii
    .map(
      (r) =>
        `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="url(#g)" stroke-width="1.2"/>`
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${0.22 * strength}"/><stop offset="0.5" stop-color="#fff" stop-opacity="${0.06 * strength}"/><stop offset="1" stop-color="#fff" stop-opacity="${0.03 * strength}"/></linearGradient>
<radialGradient id="f" cx="${cx}" cy="${cy}" r="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="glow" cx="${cx}" cy="${cy}" r="440" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${glow}" stop-opacity="${glowAlpha}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
<mask id="m"><rect width="${W}" height="${H}" fill="url(#f)"/></mask></defs>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g mask="url(#m)">${circles}</g></svg>`;
}

// The bold ring over a blurred copy of itself.
export function boldRingSvg({ cx, cy, r, color }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter></defs>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-opacity="0.5" filter="url(#b)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="4"/></svg>`;
}
