/** biome-ignore-all lint/performance/noImgElement: Satori draws plain img elements */
import sharp from 'sharp';
import { alpha } from './colours';
import { factsRow } from './facts';
import { baseline, fitTitle, lineWidth } from './fit';
import { face } from './fonts';
import {
  COPY_TOP,
  COPY_WIDTH,
  DESCRIPTION_SIZE,
  FACTS_BOTTOM,
  H,
  LOGO_CENTRE,
  LOGO_SIZE,
  MUTED,
  PATH_SIZE,
  TITLE_SIZE,
  W,
  X
} from './layout';
import { logoSrc, socialMark, svgSrc } from './mark';
import { blobGround, blockShades, jpegSrc, loadPhoto } from './photo';
import { BOLD_RING, boldRingSvg, hairlinesSvg, ringRadii } from './rings';

const PATH_LINE = PATH_SIZE * 1.2;
const TITLE_GAP = 14;
const TITLE_LINE = 1.1;
const TITLE_INK_GAP = 36;
const DESCRIPTION_LEADING = 1.4;
const DESCRIPTION_LINE = DESCRIPTION_SIZE * DESCRIPTION_LEADING;
const FACTS_LINE = 40;
const SOCIAL_MARK = 120;

// The title is held to 7:1. The muted lines (32 and 28 px, large text) are held to 4.5:1,
// AAA for large text; 7:1 is out of reach for them, 6.8:1 even on the solid default ground.
const TITLE_CONTRAST = { inkAlpha: 1, target: 7 };
const MUTED_CONTRAST = { inkAlpha: MUTED, target: 4.5 };

const Layer = ({ src }) => (
  <img
    src={src}
    width={W}
    height={H}
    alt=''
    style={{ position: 'absolute', left: 0, top: 0 }}
  />
);

const FullBleed = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: W,
      height: H,
      display: 'flex',
      ...style
    }}
  />
);

const Positioned = ({ style, children }) => (
  <div style={{ position: 'absolute', display: 'flex', ...style }}>
    {children}
  </div>
);

// The fade's opacity at x: 0.92 at the left edge, 0.66 at 70% of the width, 0.45 at the right.
const FADE = [0.92, 0.66, 0.45];
const fadeAt = (x) =>
  x <= W * 0.7
    ? FADE[0] + ((FADE[1] - FADE[0]) * x) / (W * 0.7)
    : FADE[1] + ((FADE[2] - FADE[1]) * (x - W * 0.7)) / (W * 0.3);

// What the fade lacks behind the text, as an extra shade over everything above and left of
// each block, blurred out past its bottom and right. Each block's shade is a grey level, the
// strongest drawn last, so they combine as a max. sharp blurs it, since Satori's SVG blur
// renders with hard edges.
const BLUR = 140;
async function shadeSrc(blocks, shades, ground) {
  const extents = blocks
    .map((lines, i) => {
      const right = Math.max(...lines.map((l) => l.x + l.w));
      const bottom = Math.max(...lines.map((l) => l.y + l.h));
      const base = fadeAt(right);
      return shades[i] > base
        ? { right, bottom, shade: 1 - (1 - shades[i]) / (1 - base) }
        : null;
    })
    .filter(Boolean)
    .sort((p, q) => p.shade - q.shade);
  if (!extents.length) return null;
  // sharp cuts its kernel off near 1.8 sigma, so 2.5 sigma past the text keeps the whole shade
  // over it, and the blur copies the canvas edge, so the top and left stay full. Rounded up so
  // contrast never lands under its target.
  const reach = 2.5 * BLUR;
  const grey = (shade) => {
    const v = Math.ceil(shade * 255);
    return `rgb(${v},${v},${v})`;
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}"/>${extents
    .map(
      (e) =>
        `<rect width="${e.right + reach}" height="${e.bottom + reach}" fill="${grey(e.shade)}"/>`
    )
    .join('')}</svg>`;
  const mask = await sharp(Buffer.from(svg))
    .blur(BLUR)
    .extractChannel(0)
    .raw()
    .toBuffer();
  const png = await sharp({
    create: { width: W, height: H, channels: 3, background: ground }
  })
    .joinChannel(mask, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

// The photo under its fade, with the extra shade each text block needs.
async function photoGround(photo, blocks, theme) {
  const shades = await blockShades(photo, blocks, theme.background, theme.text);
  const shade = await shadeSrc(blocks, shades, theme.background);
  return [
    <Layer key='photo' src={jpegSrc(photo)} />,
    <FullBleed
      key='fade'
      style={{
        backgroundImage: `linear-gradient(90deg, ${FADE.map((a, i) => `${alpha(theme.background, a)} ${[0, 70, 100][i]}%`).join(', ')})`
      }}
    />,
    shade && <Layer key='shade' src={shade} />
  ];
}

export async function shareCard(card) {
  const { theme, ring } = card;
  const [mont, figtree] = await Promise.all([face('mont'), face('figtree')]);
  const ink = theme.text;
  const muted = alpha(ink, MUTED);
  const title = fitTitle(mont.width, card.title, {
    width: COPY_WIDTH,
    max: TITLE_SIZE,
    min: 36
  });
  const titleTop = COPY_TOP + PATH_LINE + TITLE_GAP;
  const titleLine = title.size * TITLE_LINE;
  const titleBottom = titleTop + titleLine * title.lines.length;
  // Whatever follows the title, description or platform logo, starts its ink TITLE_INK_GAP
  // below the title's descenders, so both cards keep one rhythm.
  const nextInk =
    titleBottom -
    titleLine +
    baseline(mont, title.size, TITLE_LINE) -
    mont.descender * title.size +
    TITLE_INK_GAP;
  const descriptionTop =
    nextInk -
    (baseline(figtree, DESCRIPTION_SIZE, DESCRIPTION_LEADING) -
      figtree.capHeight * DESCRIPTION_SIZE);
  const facts = await factsRow(card.facts, muted);

  // A photo that is gone leaves the card on its no-photo ground; a transient failure throws.
  const photo = card.photo && (await loadPhoto(card.photo));
  const { cx, cy } = LOGO_CENTRE;
  const radii = ringRadii(card.id);
  const hairlines = hairlinesSvg({
    cx,
    cy,
    radii: radii.filter((_, i) => i !== BOLD_RING),
    glow: ring,
    glowAlpha: photo ? 0.26 : 0.24,
    strength: photo ? 1.5 : 1
  });

  let ground;
  if (photo) {
    const descriptionWidth = figtree.width(card.description) * DESCRIPTION_SIZE;
    const copy = [
      {
        x: X,
        y: COPY_TOP,
        w: figtree.width(card.path) * PATH_SIZE,
        h: PATH_LINE,
        ...MUTED_CONTRAST
      },
      {
        x: X,
        y: titleTop,
        w: Math.max(
          0,
          ...title.lines.map((l) => lineWidth(mont.width, l, title.size))
        ),
        h: titleBottom - titleTop,
        ...TITLE_CONTRAST
      },
      ...(card.description
        ? [
            {
              x: X,
              y: descriptionTop,
              w: Math.min(COPY_WIDTH, descriptionWidth),
              h: DESCRIPTION_LINE * (descriptionWidth > COPY_WIDTH ? 2 : 1),
              ...MUTED_CONTRAST
            }
          ]
        : [])
    ];
    const factsLine = {
      x: X,
      y: H - FACTS_BOTTOM - LOGO_SIZE / 2 - FACTS_LINE / 2,
      w: facts.width,
      h: FACTS_LINE,
      ...MUTED_CONTRAST
    };
    ground = await photoGround(
      photo,
      [copy, ...(facts.width > 0 ? [[factsLine]] : [])],
      theme
    );
  } else {
    ground = [
      <Layer key='blobs' src={await blobGround(theme, card.id)} />,
      <FullBleed
        key='veil'
        style={{ background: alpha(theme.background, 0.72) }}
      />
    ];
  }

  // A platform logo sits under the title, its ink on the title's left edge.
  const mark =
    card.socialLogo &&
    (await socialMark(card.socialLogo, card.markInk, SOCIAL_MARK));

  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Figtree',
        backgroundColor: theme.background
      }}>
      {ground}
      <Layer src={svgSrc(hairlines)} />
      <Layer
        src={svgSrc(boldRingSvg({ cx, cy, r: radii[BOLD_RING], color: ring }))}
      />
      <Positioned
        style={{
          left: X,
          top: COPY_TOP,
          width: COPY_WIDTH,
          flexDirection: 'column'
        }}>
        <div style={{ display: 'flex', fontSize: PATH_SIZE, color: muted }}>
          {card.path}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: TITLE_GAP,
            fontFamily: 'Mont',
            fontWeight: 700,
            fontSize: title.size,
            lineHeight: TITLE_LINE,
            letterSpacing: '-0.02em',
            color: ink,
            whiteSpace: 'nowrap'
          }}>
          {title.lines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {line}
            </div>
          ))}
        </div>
        {card.description && (
          <div
            style={{
              display: 'block',
              lineClamp: 2,
              marginTop: descriptionTop - titleBottom,
              fontSize: DESCRIPTION_SIZE,
              lineHeight: DESCRIPTION_LEADING,
              color: muted
            }}>
            {card.description}
          </div>
        )}
      </Positioned>
      {mark && (
        <img
          src={mark.src}
          width={mark.width}
          height={mark.height}
          alt=''
          style={{
            position: 'absolute',
            left: Math.round(X - mark.inkLeft),
            top: Math.round(nextInk - mark.inkTop)
          }}
        />
      )}
      <Positioned
        style={{
          left: X,
          right: X,
          bottom: FACTS_BOTTOM,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        {facts.element}
        {card.logo && (
          <img
            src={logoSrc(card.logo, '#ffffff')}
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            alt=''
          />
        )}
      </Positioned>
    </div>
  );
}
