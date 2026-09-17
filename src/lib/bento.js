// Deterministic PRNG (mulberry32): the server and the client must agree on every tile shape.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SHAPES = ['1x1', '2x1', '1x2', '2x2'];
// A shape is 'WxH' in grid cells.
export const shapeSize = (shape) => shape.split('x').map(Number);
// Cumulative weights: half the tiles stay square so the grid reads as a grid.
const WEIGHTS = [0.5, 0.7, 0.85, 1];

// Shape per position from one seed (the post count by default), so publishing a post
// re-settles the whole grid. Featured posts always take the big tile.
export function tileShapes(posts, seed = posts.length) {
  const random = mulberry32(seed);
  return posts.map((post) => {
    const r = random();
    const shape = SHAPES[WEIGHTS.findIndex((w) => r < w)];
    return post.featured ? '2x2' : shape;
  });
}

// Small string hash (FNV-1a) to seed a post's own draw.
function hashId(id) {
  let h = 0x811c9dc5;
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
  return h >>> 0;
}

// Band (copy at the bottom or the top) per POST, drawn from its id, so a post keeps
// its band through every filter and a morphing tile never cross-fades two layouts.
export function tileBands(posts) {
  return posts.map((post) =>
    mulberry32(hashId(post._id))() < 0.65 ? 'bottom' : 'top'
  );
}

// Phones have two columns, so the tall and big shapes fold to their wide counterparts.
export function phoneShape(shape) {
  return shape === '2x2' ? '2x1' : shape === '1x2' ? '1x1' : shape;
}

// Rows as bitmasks; a tile lands on the first free run the dense grid would give it.
function place(rows, shape, columns, located = () => {}) {
  const [width, height] = shapeSize(shape);
  for (let y = 0; ; y++) {
    for (let x = 0; x <= columns - width; x++) {
      const mask = ((1 << width) - 1) << x;
      const blocked = Array.from(
        { length: height },
        (_, dy) => rows[y + dy] || 0
      ).some((row) => row & mask);
      if (blocked) continue;
      located({ x, y, width, height });
      const next = [...rows];
      for (let dy = 0; dy < height; dy++)
        next[y + dy] = (next[y + dy] || 0) | mask;
      return next;
    }
  }
}

// The same dense first-fit placement used by fillPages, exposed for capture planning.
export function denseLayout(shapes, columns = 4) {
  let rows = [];
  return shapes.map((shape) => {
    let box;
    rows = place(rows, shape, columns, (cell) => {
      box = cell;
    });
    return box;
  });
}

// A survivor this far outside the viewport on both sides is not worth a named morph.
const OFFSCREEN_MARGIN = 256;

export function animatesTile(before, after, viewport) {
  // Single-sided snapshots own the entry/exit fades, even off screen.
  if (!before || !after) return true;
  if (['x', 'y', 'width', 'height'].every((key) => before[key] === after[key]))
    return false;
  const outside = (box) =>
    box.x + box.width < -OFFSCREEN_MARGIN ||
    box.x > viewport.width + OFFSCREEN_MARGIN ||
    box.y + box.height < -OFFSCREEN_MARGIN ||
    box.y > viewport.height + OFFSCREEN_MARGIN;
  return !(outside(before) && outside(after));
}

// Fills one page at a time, so a later page never reopens the closed tail of a page
// already on screen; a flush page lets the dense grid start the next on a fresh row.
export function fillPages(
  shapes,
  page,
  columns = 4,
  locked = () => false,
  candidates = FILL
) {
  const pages = [];
  for (let start = 0; start < shapes.length; start += page)
    pages.push(
      fillLayout(
        shapes.slice(start, start + page),
        columns,
        (i) => locked(start + i),
        candidates
      )
    );
  return pages.flat();
}

// Largest first, so a handful of results still fills a block.
const FILL = ['2x2', '1x2', '2x1', '1x1'];

// Repacks the shortest trailing run until every row is full, so the grid never ends
// on a hole. Nothing is redrawn: only the tail changes shape, and a locked tile in it
// (a featured 2x2) keeps its own while its neighbours close the block around it.
export function fillLayout(
  shapes,
  columns = 4,
  locked = () => false,
  candidates = FILL
) {
  const full = (1 << columns) - 1;
  // The guard that stops place() looping on a candidate wider than the columns.
  const fits = candidates.filter((shape) => shapeSize(shape)[0] <= columns);
  const prefixes = [[]];
  for (const shape of shapes)
    prefixes.push(place(prefixes.at(-1), shape, columns));
  if (prefixes.at(-1).every((row) => row === full)) return shapes;

  // A state that failed once fails again; four candidates would otherwise branch too far.
  const failed = new Set();
  function finish(rows, i) {
    const remaining = shapes.length - i;
    if (!remaining) return rows.every((row) => row === full) ? [] : null;
    const holes = rows.reduce(
      (sum, row) => sum + columns - row.toString(2).replaceAll('0', '').length,
      0
    );
    // A 2x2 covers four cells, so more holes than that per tile cannot close.
    if (holes > remaining * 4) return null;
    const key = `${rows.join(',')}|${i}`;
    if (failed.has(key)) return null;
    for (const shape of locked(i) ? [shapes[i]] : fits) {
      const tail = finish(place(rows, shape, columns), i + 1);
      if (tail) return [shape, ...tail];
    }
    failed.add(key);
    return null;
  }

  for (let start = shapes.length - 1; start >= 0; start--) {
    const tail = finish(prefixes[start], start);
    if (tail) return [...shapes.slice(0, start), ...tail];
  }
  return shapes;
}

// Whether a tile's photo (cover scale: the larger of the box height and the height its width implies) gets smaller between two boxes.
export function photoShrinks(before, after, aspect) {
  const area = (box) => box.width * box.height;
  const scale = (box) => Math.max(box.width / aspect, box.height);
  if (
    Math.abs(before.width / before.height - after.width / after.height) < 0.01
  )
    return false;
  if (area(before) < area(after)) return false;
  return area(before) > area(after) || scale(before) > scale(after);
}

// Copy, marks and photos sample the same moving frame on the same curve.
const FRAME_STEPS = 100;
function sampleFrames(before, after, [x1, y1, x2, y2], frame) {
  const bezier = (t, a, b) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  return Array.from({ length: FRAME_STEPS + 1 }, (_, i) => {
    const t = i / FRAME_STEPS;
    const progress = bezier(t, y1, y2);
    const width = before.width + (after.width - before.width) * progress;
    const height = before.height + (after.height - before.height) * progress;
    const fit = Math.max(width / after.width, height / after.height);
    return frame({ offset: bezier(t, x1, x2), width, height, fit });
  });
}

// Counter the snapshot cover fit so live content keeps its size and its own frame anchor.
export function liveFrames(
  before,
  after,
  { x: anchorX, y: anchorY, reflow = false, inset = 0 },
  curve
) {
  return sampleFrames(
    before,
    after,
    curve,
    ({ offset, width, height, fit }) => {
      const right = anchorX === 'right';
      const top = anchorY === 'top';
      const padding = inset * (1 - 1 / fit);
      const x =
        ((after.width - width / fit) / 2) * (right ? -1 : 1) +
        (right ? padding : 0);
      const y = ((after.height - height / fit) / 2 - padding) * (top ? 1 : -1);
      return {
        offset,
        ...(reflow ? { width: `${width}px` } : {}),
        transformOrigin: `${right ? '100%' : '0'} ${top ? '0' : '100%'}`,
        transform: `translate(${x}px, ${y}px) scale(${1 / fit})`
      };
    }
  );
}

// A snapshot is a flat bitmap cover-fitted into the moving frame, so the live photo is driven to the frame's own cover scale each step and the new snapshot shows it zoom-free; offsets sample the bezier so linear steps follow the curve.
export function photoFrames(before, after, aspect, [px, py], curve) {
  const frames = sampleFrames(
    before,
    after,
    curve,
    ({ offset, width, height, fit }) => {
      // The snapshot's own cover zoom into this frame; drawing the photo at 1/fit lands it at cover scale after the zoom.
      const photoWidth = Math.max(width, height * aspect) / fit;
      return {
        offset,
        width: photoWidth,
        x:
          ((width - photoWidth * fit) * px - (width - after.width * fit) / 2) /
          fit,
        y:
          ((height - (photoWidth / aspect) * fit) * py -
            (height - after.height * fit) / 2) /
          fit
      };
    }
  );
  // A fixed raster size avoids the soft intermediate image left by animating the img's dimensions.
  const width = Math.max(...frames.map((frame) => frame.width));
  return frames.map((frame) => ({
    offset: frame.offset,
    width: `${width}px`,
    height: `${width / aspect}px`,
    left: '0px',
    top: '0px',
    transformOrigin: '0 0',
    transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.width / width})`
  }));
}
