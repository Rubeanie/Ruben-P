/* eslint-disable @next/next/no-img-element -- Satori draws plain img elements */
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

// What the fade lacks behind a block, as an extra shade that feathers out over FEATHER px
// above, below and to the right of it; gradients, since a blur filter here rendered hard edges.
const FEATHER = 48;
function shadeSvg(blocks, shades, ground) {
  const shapes = blocks.map((lines, i) => {
    const right = Math.max(...lines.map((l) => l.x + l.w));
    const top = Math.min(...lines.map((l) => l.y)) - FEATHER;
    const height = Math.max(...lines.map((l) => l.y + l.h)) - top + FEATHER;
    const width = right + FEATHER;
    const base = fadeAt(right);
    if (shades[i] <= base) return '';
    const a = (1 - (1 - shades[i]) / (1 - base)).toFixed(3);
    const f = (FEATHER / height).toFixed(3);
    const stop = (offset, opacity) =>
      `<stop offset="${offset}" stop-color="${ground}" stop-opacity="${opacity}"/>`;
    return `<linearGradient id="v${i}" x1="0" y1="0" x2="0" y2="1">${stop(0, 0)}${stop(f, a)}${stop(1 - f, a)}${stop(1, 0)}</linearGradient>
<linearGradient id="h${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="${(right / width).toFixed(3)}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="m${i}"><rect y="${top}" width="${width}" height="${height}" fill="url(#h${i})"/></mask>
<rect y="${top}" width="${width}" height="${height}" fill="url(#v${i})" mask="url(#m${i})"/>`;
  });
  return shapes.some(Boolean)
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${shapes.join('')}</svg>`
    : null;
}

// The photo under its fade, with the extra shade each text block needs.
async function photoGround(photo, blocks, theme) {
  const shades = await blockShades(photo, blocks, theme.background, theme.text);
  const shade = shadeSvg(blocks, shades, theme.background);
  return [
    <Layer key='photo' src={jpegSrc(photo)} />,
    <FullBleed
      key='fade'
      style={{
        backgroundImage: `linear-gradient(90deg, ${FADE.map((a, i) => `${alpha(theme.background, a)} ${[0, 70, 100][i]}%`).join(', ')})`
      }}
    />,
    shade && <Layer key='shade' src={svgSrc(shade)} />
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

  // A photo that fails to load leaves the card on its no-photo ground rather than failing it.
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
        <img
          src={logoSrc(card.logo, '#ffffff')}
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          alt=''
        />
      </Positioned>
    </div>
  );
}
