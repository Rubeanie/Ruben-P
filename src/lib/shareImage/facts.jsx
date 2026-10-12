import { INKS, inkFor } from '@/lib/posts';
import { DEFAULT_THEME_COLORS } from '@/lib/themes';
import { fitTags } from './fit';
import { face } from './fonts';
import { FACTS_SIZE, FACTS_WIDTH } from './layout';

const GAP = 28;
const TAG_GAP = 10;
const CAPSULE_SIZE = Math.round(FACTS_SIZE * 0.85);
const CAPSULE_PAD = Math.round(CAPSULE_SIZE * 0.62);

const Capsule = ({ children, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: CAPSULE_SIZE * 1.6,
      padding: `0 ${CAPSULE_PAD}px`,
      borderRadius: 999,
      fontSize: CAPSULE_SIZE,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style
    }}>
    {children}
  </div>
);

// Date, category capsules or the handle on one line; returns the drawn width for the shade under it.
export async function factsRow({ date, categories = [], handle }, color) {
  const [{ width: regular }, { width: semi }] = await Promise.all([
    face('figtree'),
    face('figtreeSemiBold')
  ]);
  const texts = [date, handle].filter(Boolean);
  const textWidth = texts.reduce((w, t) => w + regular(t) * FACTS_SIZE, 0);
  const tagWidth = (t) => semi(t) * CAPSULE_SIZE + CAPSULE_PAD * 2;
  const room = FACTS_WIDTH - textWidth - GAP * texts.length;
  const { shown, more } = fitTags(
    categories.map((c) => c.title),
    room,
    { tagWidth, plusWidth: (n) => tagWidth(`+${n}`), gap: TAG_GAP }
  );
  const capsules = [...shown, ...(more ? [`+${more}`] : [])].map(tagWidth);
  const pieces = [
    ...texts.map((t) => regular(t) * FACTS_SIZE),
    ...(capsules.length ? [capsules.reduce((a, b) => a + b + TAG_GAP)] : [])
  ];
  const width = Math.min(
    FACTS_WIDTH,
    pieces.reduce((a, b) => a + b + GAP, -GAP)
  );
  const element = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: GAP,
        width: FACTS_WIDTH,
        fontSize: FACTS_SIZE,
        color,
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
      {date && <div style={{ display: 'flex' }}>{date}</div>}
      {shown.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: TAG_GAP }}>
          {shown.map((title, i) => {
            const bg = categories[i].color || DEFAULT_THEME_COLORS.primary;
            return (
              <Capsule
                key={i}
                style={{ background: bg, color: INKS[inkFor(bg)] }}>
                {title}
              </Capsule>
            );
          })}
          {more > 0 && (
            <Capsule style={{ border: `1px solid ${color}`, color }}>
              {`+${more}`}
            </Capsule>
          )}
        </div>
      )}
      {handle && <div style={{ display: 'flex' }}>{handle}</div>}
    </div>
  );
  return { element, width };
}
