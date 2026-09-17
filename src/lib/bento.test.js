import { expect, test } from 'bun:test';
import {
  animatesTile,
  denseLayout,
  liveFrames,
  fillLayout,
  fillPages,
  mulberry32,
  phoneShape,
  photoFrames,
  photoShrinks,
  SHAPES,
  shapeSize,
  tileBands,
  tileShapes
} from './bento';

test('shapeSize reads a shape as cell numbers', () => {
  expect(shapeSize('1x1')).toEqual([1, 1]);
  expect(shapeSize('2x1')).toEqual([2, 1]);
  expect(shapeSize('1x2')).toEqual([1, 2]);
  expect(shapeSize('2x2')).toEqual([2, 2]);
});

test('capture selection keeps fades, drops identity and distant survivors', () => {
  const viewport = { width: 1440, height: 900 };
  const box = { x: 0, y: 0, width: 200, height: 200 };
  const far = { ...box, y: 1600 };
  expect(animatesTile(box, { ...box }, viewport)).toBe(false);
  expect(animatesTile(far, { ...far, x: 300 }, viewport)).toBe(false);
  expect(animatesTile(box, far, viewport)).toBe(true);
  expect(animatesTile(far, box, viewport)).toBe(true);
  expect(animatesTile(undefined, far, viewport)).toBe(true);
  expect(animatesTile(far, undefined, viewport)).toBe(true);
  expect(animatesTile({ ...box, y: 1100 }, far, viewport)).toBe(true);
});

test('dense prediction fills holes and Load more preserves every closed page', () => {
  expect(denseLayout(['1x2', '2x1', '2x1', '1x1'])).toEqual([
    { x: 0, y: 0, width: 1, height: 2 },
    { x: 1, y: 0, width: 2, height: 1 },
    { x: 1, y: 1, width: 2, height: 1 },
    { x: 3, y: 0, width: 1, height: 1 }
  ]);
  for (const columns of [2, 4]) {
    const posts = Array.from({ length: 48 }, (_, i) => ({
      _id: String(i),
      featured: i % 9 === 0
    }));
    const shapes = tileShapes(posts).map((s) =>
      columns === 2 ? phoneShape(s) : s
    );
    const fill = (n) =>
      denseLayout(
        fillPages(
          shapes.slice(0, n),
          12,
          columns,
          (i) => posts[i].featured,
          columns === 2 ? ['2x1', '1x1'] : undefined
        ),
        columns
      );
    for (const n of [12, 24, 36])
      expect(fill(n + 12).slice(0, n)).toEqual(fill(n));
  }
});

test('mulberry32 is deterministic and stays in [0,1)', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 20; i++) {
    const va = a();
    const vb = b();
    expect(va).toBe(vb);
    expect(va).toBeGreaterThanOrEqual(0);
    expect(va).toBeLessThan(1);
  }
});

const posts = (n) =>
  Array.from({ length: n }, (_, i) => ({ _id: `${i}`, featured: false }));

test('tileShapes returns one of SHAPES per post', () => {
  const shapes = tileShapes(posts(12), 12);
  expect(shapes).toHaveLength(12);
  for (const shape of shapes) expect(SHAPES).toContain(shape);
});

test('tileShapes is the same array for the same seed', () => {
  expect(tileShapes(posts(12), 12)).toEqual(tileShapes(posts(12), 12));
});

test('tileShapes differs for a different seed', () => {
  expect(tileShapes(posts(12), 12)).not.toEqual(tileShapes(posts(12), 13));
});

test('featured posts always get the big tile', () => {
  const list = posts(6);
  list[2].featured = true;
  list[4].featured = true;
  const shapes = tileShapes(list, 6);
  expect(shapes[2]).toBe('2x2');
  expect(shapes[4]).toBe('2x2');
});

test("a non-featured post's shape does not change when an earlier post becomes featured", () => {
  const before = posts(6);
  const after = posts(6);
  after[0].featured = true;

  const shapesBefore = tileShapes(before, 6);
  const shapesAfter = tileShapes(after, 6);

  for (let i = 1; i < 6; i++) expect(shapesAfter[i]).toBe(shapesBefore[i]);
});

test('tileBands draws one band per post and is deterministic', () => {
  const bands = tileBands(posts(40));
  expect(bands).toHaveLength(40);
  for (const band of bands) expect(['bottom', 'top']).toContain(band);
  expect(bands).toEqual(tileBands(posts(40)));
  expect(bands).toContain('bottom');
  expect(bands).toContain('top');
});

test('tileBands is a property of the post, not its neighbours', () => {
  const all = posts(40);
  const bands = tileBands(all);
  const filtered = all.filter((_, i) => i % 3 === 0);
  expect(tileBands(filtered)).toEqual(
    filtered.map((p) => bands[Number(p._id)])
  );
  expect(tileBands([...all].reverse())).toEqual([...bands].reverse());
});

test('tileBands does not follow the shape stream', () => {
  const list = posts(200);
  const shapes = tileShapes(list, 200);
  const bands = tileBands(list);
  const topOnSquares = shapes.filter(
    (s, i) => s === '1x1' && bands[i] === 'top'
  );
  expect(topOnSquares.length).toBeGreaterThan(0);
});

test('phoneShape folds tall and big to square and wide', () => {
  expect(phoneShape('1x2')).toBe('1x1');
  expect(phoneShape('2x2')).toBe('2x1');
  expect(phoneShape('2x1')).toBe('2x1');
  expect(phoneShape('1x1')).toBe('1x1');
});

// Cells a list of shapes occupies, so a full grid can be asserted directly.
const cells = (shapes) =>
  shapes.reduce((sum, s) => {
    const [w, h] = shapeSize(s);
    return sum + w * h;
  }, 0);

test('fillLayout leaves a full grid alone', () => {
  const shapes = ['2x2', '1x1', '1x1', '1x1', '1x1'];
  expect(fillLayout(shapes)).toEqual(shapes);
});

test('fillLayout closes trailing holes and keeps the count', () => {
  const shapes = ['2x2', '1x2', '1x1', '2x1', '1x2', '1x1', '1x1'];
  const filled = fillLayout(shapes);
  expect(filled).toHaveLength(shapes.length);
  expect(cells(filled) % 4).toBe(0);
  const before = filled.findIndex((s, i) => s !== shapes[i]);
  for (let i = before + 1; i < filled.length; i++)
    expect(SHAPES).toContain(filled[i]);
});

test('fillLayout closes a tall hole beside a big tile with tall tiles', () => {
  expect(fillLayout(['2x2', '1x1', '1x1'])).toEqual(['2x2', '1x2', '1x2']);
});

test('fillLayout returns a flush list of twelve unchanged', () => {
  const flush = [
    '2x2',
    '1x2',
    '1x2',
    '2x1',
    '2x1',
    '1x1',
    '1x1',
    '1x1',
    '1x1',
    '2x1',
    '1x1',
    '1x1'
  ];
  expect(fillLayout(flush)).toEqual(flush);
  expect(fillLayout(Array(12).fill('1x1'))).toEqual(Array(12).fill('1x1'));
});

test('fillLayout works with two columns and only the phone shapes', () => {
  const filled = fillLayout(
    ['2x1', '1x1', '2x1', '1x1', '1x1'],
    2,
    () => false,
    ['2x1', '1x1']
  );
  expect(cells(filled) % 2).toBe(0);
  for (const shape of filled) expect(['1x1', '2x1']).toContain(shape);
});

test('fillLayout returns the input when no repack can close the grid', () => {
  expect(fillLayout(['1x1'])).toEqual(['1x1']);
});

test('fillLayout never repacks a locked tile', () => {
  expect(fillLayout(['1x2', '1x1'])).toEqual(['2x2', '2x2']);
  expect(fillLayout(['1x2', '1x1'], 4, (i) => i === 0)).toEqual(['1x2', '1x1']);
});

test('fillLayout closes the block around a locked tile that sits last', () => {
  const locked = (i) => i === 2;
  expect(fillLayout(['1x2', '1x1', '2x2'], 4, locked)).toEqual([
    '1x2',
    '1x2',
    '2x2'
  ]);
  expect(fillLayout(['1x1', '1x1', '2x1'], 2, locked, ['2x1', '1x1'])).toEqual([
    '1x1',
    '1x1',
    '2x1'
  ]);
});

test('fillPages keeps the first page as it was once the second arrives', () => {
  const shapes = tileShapes(posts(13), 13);
  const firstPage = fillPages(shapes.slice(0, 12), 12);
  expect(fillPages(shapes, 12).slice(0, 12)).toEqual(firstPage);
  expect(cells(firstPage) % 4).toBe(0);
});

const box = (w, h) => ({ width: w, height: h });
const EASE_OUT = [0.23, 1, 0.32, 1];

test('liveFrames keeps glyphs at natural size and both band anchors inside the moving frame', () => {
  const shapes = [box(218, 218), box(472, 218), box(218, 472), box(472, 472)];
  for (const before of shapes)
    for (const after of shapes)
      for (const top of [true, false]) {
        const frames = liveFrames(
          before,
          after,
          { x: 'center', y: top ? 'top' : 'bottom', reflow: true },
          EASE_OUT
        );
        expect(frames[0].offset).toBe(0);
        expect(frames.at(-1).offset).toBe(1);
        expect(frames.at(-1).transform).toBe('translate(0px, 0px) scale(1)');
        for (const [i, frame] of frames.entries()) {
          const [, rawX, rawY, rawScale] = frame.transform.match(
            /translate\((.+)px, (.+)px\) scale\((.+)\)/
          );
          const [x, y, scale] = [rawX, rawY, rawScale].map(Number);
          const width = parseFloat(frame.width);
          const t = i / (frames.length - 1);
          const height =
            before.height + (after.height - before.height) * (1 - (1 - t) ** 3);
          const fit = Math.max(width / after.width, height / after.height);
          expect(scale * fit).toBeCloseTo(1, 10);
          expect((width - after.width * fit) / 2 + x * fit).toBeCloseTo(0, 10);
          const anchor = top ? y : after.height + y;
          expect((height - after.height * fit) / 2 + anchor * fit).toBeCloseTo(
            top ? 0 : height,
            10
          );
          if (i) expect(frame.offset).toBeGreaterThan(frames[i - 1].offset);
        }
      }
});

test('photoShrinks: aspect-changing shrinks and tall-to-wide swaps only', () => {
  expect(photoShrinks(box(472, 472), box(472, 218), 1.6)).toBe(true);
  expect(photoShrinks(box(472, 472), box(218, 472), 1.6)).toBe(true);
  expect(photoShrinks(box(218, 472), box(472, 218), 1.6)).toBe(true);
  expect(photoShrinks(box(472, 218), box(218, 472), 1.6)).toBe(false);
  expect(photoShrinks(box(218, 218), box(472, 218), 1.6)).toBe(false);
  expect(photoShrinks(box(472, 472), box(218, 218), 1.6)).toBe(false);
});

test('photoFrames: ends at the live cover placement and starts at 1/zoom, offsets follow the curve', () => {
  const frames = photoFrames(
    box(472, 472),
    box(472, 218),
    1.6,
    [0.5, 0.5],
    EASE_OUT
  );
  expect(frames).toHaveLength(101);
  expect(frames[0].offset).toBe(0);
  expect(frames.at(-1).offset).toBe(1);
  expect(
    frames.every((f, i) => i === 0 || f.offset > frames[i - 1].offset)
  ).toBe(true);
  // One raster for every step: the final cover width of the photo in a 472x218 box.
  expect(frames.every((f) => f.width === '472px' && f.height === '295px')).toBe(
    true
  );
  const read = (t) => t.match(/-?[\d.]+/g).map(Number);
  // The end frame is the plain cover: a centred 472x295 photo in the 218px-high box.
  expect(read(frames.at(-1).transform)).toEqual([0, -38.5, 1]);
  // At the start the snapshot is zoomed 472/218; the photo is drawn at 1/zoom (755 cover width / 2.165) and offset so the zoom re-centres it.
  const [x, y, scale] = read(frames[0].transform);
  expect(scale).toBeCloseTo(348.8 / 472, 3);
  expect(x).toBeCloseTo(61.6, 1);
  expect(y).toBeCloseTo(0, 6);
});

test('liveFrames pins fixed-size marks to either right corner at the final inset', () => {
  const shapes = [box(218, 218), box(472, 218), box(218, 472), box(472, 472)];
  for (const before of shapes)
    for (const after of shapes)
      for (const top of [true, false])
        for (const inset of [12, 16]) {
          const frames = liveFrames(
            before,
            after,
            {
              x: 'right',
              y: top ? 'top' : 'bottom',
              inset
            },
            EASE_OUT
          );
          expect(frames).toHaveLength(101);
          for (const [i, frame] of frames.entries()) {
            expect(frame.width).toBeUndefined();
            const [, rawX, rawY, rawScale] = frame.transform.match(
              /translate\((.+)px, (.+)px\) scale\((.+)\)/
            );
            const [x, y, scale] = [rawX, rawY, rawScale].map(Number);
            const progress = 1 - (1 - i / 100) ** 3;
            const width =
              before.width + (after.width - before.width) * progress;
            const height =
              before.height + (after.height - before.height) * progress;
            const fit = Math.max(width / after.width, height / after.height);
            expect(scale * fit).toBeCloseTo(1, 10);
            expect(
              (width - after.width * fit) / 2 + (after.width - inset + x) * fit
            ).toBeCloseTo(width - inset, 10);
            expect(
              (height - after.height * fit) / 2 +
                ((top ? inset : after.height - inset) + y) * fit
            ).toBeCloseTo(top ? inset : height - inset, 10);
          }
        }
});
