// Draws diagram.svg, the circle-packing map of the codebase in the README.
// Run with `bun run diagram`; CI redraws it after every push to master.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { hierarchy, pack } from 'd3-hierarchy';

const SIZE = 1000;
const MARGIN = 20;
const BACKGROUND = '#0f182d';
const TEXT = '#eaf6ff';
const MUTED = '#a9b6c9';
const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

// Generated or binary files that would drown out the source.
const SKIP =
  /(^|\/)(bun\.lock|diagram\.svg)$|\.(woff2?|ttf|otf|glb|png|jpe?g|ico|webp|gif)$/;

const KINDS = [
  { name: 'JavaScript', colour: '#ed5f68', test: /\.(m|c)?jsx?$/ },
  { name: 'Styles', colour: '#7f9cf5', test: /\.s?css$/ },
  { name: 'Config', colour: '#e8b86d', test: /\.(json|ya?ml)$|(^|\/)\.[^/]+$/ },
  { name: 'Docs', colour: '#7fd1b9', test: /\.(md|txt)$/ },
  { name: 'Markup', colour: '#b69cf0', test: /\.(svg|html)$/ },
  { name: 'Other', colour: '#5d7097', test: /./ }
];
const kindOf = (path) => KINDS.find((kind) => kind.test.test(path));

// Committed blob sizes rather than fs.stat, so CRLF checkouts draw the same picture.
const files = execFileSync('git', ['ls-tree', '-r', '-l', '-z', 'HEAD'], {
  encoding: 'utf8'
})
  .split('\0')
  .filter(Boolean)
  .map((line) => {
    const [meta, path] = line.split('\t');
    return { path, size: Number(meta.trim().split(/\s+/)[3]) };
  })
  .filter((file) => file.size > 0 && !SKIP.test(file.path))
  .sort((a, b) => (a.path < b.path ? -1 : 1));

// Nest the flat paths into folders.
const tree = { name: '', children: [] };
for (const file of files) {
  let folder = tree;
  const parts = file.path.split('/');
  for (const name of parts.slice(0, -1)) {
    let next = folder.children.find((child) => child.name === name);
    if (!next) folder.children.push((next = { name, children: [] }));
    folder = next;
  }
  folder.children.push({
    name: parts.at(-1),
    path: file.path,
    size: file.size
  });
}

const root = pack()
  .size([SIZE - 2 * MARGIN, SIZE - 2 * MARGIN])
  .padding((node) => [6, 14][node.depth] ?? 9)(
  hierarchy(tree)
    .sum((node) => node.size ?? 0)
    .sort((a, b) => b.value - a.value || (a.data.name < b.data.name ? -1 : 1))
);

const round = (n) => Math.round(n * 10) / 10;
const at = (n) => round(n + MARGIN);
const escape = (text) =>
  text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
// Rough width of the system sans at a given size.
const width = (text, size) => text.length * size * 0.56;

// Claims room for a label, unless it would overlap one already placed.
const placed = [];
const claim = (cx, cy, w, h) => {
  const box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  const hit = placed.some(
    (b) => box[0] < b[2] && b[0] < box[2] && box[1] < b[3] && b[1] < box[3]
  );
  if (!hit) placed.push(box);
  return !hit;
};
// A separate halo pass, since curved text paints each glyph's stroke over its
// neighbour when paint-order does it in one.
const label = (attrs, content) =>
  [
    `fill="${BACKGROUND}" stroke="${BACKGROUND}" stroke-width="4"`,
    `fill="${MUTED}"`
  ]
    .map(
      (paint) =>
        `<text ${attrs} ${paint} dy="0.35em" text-anchor="middle">${content}</text>`
    )
    .join('');

const shapes = [];
const labels = [];
root.descendants().forEach((node, i) => {
  if (node.depth === 0) return;
  const [x, y, r] = [at(node.x), at(node.y), round(node.r)];

  if (node.children) {
    shapes.push(
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${TEXT}" fill-opacity="0.025" stroke="${TEXT}" stroke-opacity="0.16"/>`
    );
    // Folder names ride the top of their circle, or the bottom when a parent's
    // name already sits there, knocked out of the outline.
    const size = node.depth === 1 ? 14 : 11;
    const w = width(node.data.name, size);
    const side =
      w <= r * 1.8 && [1, -1].find((s) => claim(x, y - s * r, w + 4, size + 4));
    if (!side) return;
    labels.push(
      `<path id="f${i}" d="M${at(node.x - node.r)},${y}A${r},${r} 0 0 ${+(side > 0)} ${at(node.x + node.r)},${y}" fill="none"/>`,
      label(
        `font-size="${size}"`,
        `<textPath href="#f${i}" startOffset="50%">${escape(node.data.name)}</textPath>`
      )
    );
    return;
  }

  shapes.push(
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${kindOf(node.data.path).colour}"/>`
  );
  // Only the biggest files get a name; it may spill past its circle.
  if (r >= 12 && claim(x, y, width(node.data.name, 10) + 4, 14)) {
    labels.push(
      label(`x="${x}" y="${y}" font-size="10"`, escape(node.data.name))
    );
  }
});

// Legend in the empty bottom-left corner, only for kinds that appear.
const used = KINDS.filter((kind) => files.some((f) => kindOf(f.path) === kind));
const legend = used.map((kind, i) => {
  const y = SIZE - 24 - (used.length - 1 - i) * 20;
  return `<circle cx="30" cy="${y}" r="5" fill="${kind.colour}"/><text x="44" y="${y}" dy="0.35em" font-size="12" fill="${MUTED}">${kind.name}</text>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" font-family="${FONT}">
<rect width="100%" height="100%" fill="${BACKGROUND}"/>
${[...shapes, ...labels, ...legend].join('\n')}
</svg>
`;

writeFileSync(new URL('../diagram.svg', import.meta.url), svg);
console.log(`Drew ${files.length} files into diagram.svg`);
