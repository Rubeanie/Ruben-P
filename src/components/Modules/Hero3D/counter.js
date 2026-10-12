// The counter (the hole in the mark) measured from the geometry: the widest
// circle in the logo's XY plane that no triangle's footprint covers, so a line
// along the logo's z through its centre clears every wall by `r`, in the
// logo's own units. Searched once from a rough guess.

function segment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1))
  );
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

// Distance from (px, py) to the nearest footprint; 0 inside one.
function clearance(tris, px, py) {
  let min = Infinity;
  for (const [ax, ay, bx, by, cx, cy] of tris) {
    const s1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
    const s2 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
    const s3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
    if ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0))
      return 0;
    min = Math.min(
      min,
      segment(px, py, ax, ay, bx, by),
      segment(px, py, bx, by, cx, cy),
      segment(px, py, cx, cy, ax, ay)
    );
  }
  return min;
}

export default function findCounter(geometry, [gx, gy]) {
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const tris = [];
  for (let i = 0; i < index.count; i += 3) {
    const v = [0, 1, 2].flatMap((k) => [
      pos.getX(index.getX(i + k)),
      pos.getY(index.getX(i + k))
    ]);
    tris.push(v);
  }
  let best = { x: gx, y: gy, r: clearance(tris, gx, gy) };
  for (let x = gx - 0.2; x <= gx + 0.2; x += 0.02) {
    for (let y = gy - 0.2; y <= gy + 0.2; y += 0.02) {
      const r = clearance(tris, x, y);
      if (r > best.r) best = { x, y, r };
    }
  }
  // Pattern search: step to the best neighbour, halve the step when none is better.
  const around = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];
  for (let step = 0.01; step > 1e-5;) {
    let moved = false;
    for (const [dx, dy] of around) {
      const x = best.x + dx * step;
      const y = best.y + dy * step;
      const r = clearance(tris, x, y);
      if (r > best.r) {
        best = { x, y, r };
        moved = true;
      }
    }
    if (!moved) step /= 2;
  }
  return best;
}
