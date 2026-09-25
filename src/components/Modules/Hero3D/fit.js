import { MathUtils } from 'three';

// How far back the camera sits at rest, as a multiple of REST, so the turning mark
// at its widest yaw takes at most WIDTH and HEIGHT of the frame. It only pulls back.
const REST = 3;
const FOV = 60;
const WIDTH = 0.86;
const HEIGHT = 0.58;
const YAWS = 48;

export default function createFit(geometry) {
  const pos = geometry.attributes.position;
  const points = [];
  for (let k = 0; k < YAWS; k++) {
    const a = (k / YAWS) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      points.push(x * c + z * s, pos.getY(i), z * c - x * s);
    }
  }
  const half = Math.tan(MathUtils.degToRad(FOV / 2));
  // Whether the mark stays inside WIDTH and HEIGHT from distance d.
  const fits = (d, aspect) => {
    let w = 0;
    let h = 0;
    for (let i = 0; i < points.length; i += 3) {
      const depth = d - points[i + 2];
      w = Math.max(w, Math.abs(points[i]) / depth);
      h = Math.max(h, Math.abs(points[i + 1]) / depth);
    }
    return w / (half * aspect) <= WIDTH && h / half <= HEIGHT;
  };
  const cache = new Map();

  return (aspect) => {
    const key = aspect.toFixed(3);
    if (!cache.has(key)) {
      let lo = REST;
      let hi = REST * 8;
      if (!fits(lo, aspect)) {
        for (let i = 0; i < 24; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid, aspect)) hi = mid;
          else lo = mid;
        }
        lo = hi;
      }
      cache.set(key, lo / REST);
    }
    return cache.get(key);
  };
}
