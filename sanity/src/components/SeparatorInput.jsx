import { useRef } from 'react';
import { Card, Grid, Stack, Text } from '@sanity/ui';
import { LuMegaphone } from 'react-icons/lu';
import { set, useClient } from 'sanity';
import { apiVersion } from '@/lib/env';
import { SEPARATORS } from '@/lib/announcement';
import { useSiteLogo } from '../useSiteLogo';
import AnnouncementSeparator from '@/components/AnnouncementSeparator';

function LogoMedia() {
  const logo = useSiteLogo(useClient({ apiVersion }));
  return logo ? <AnnouncementSeparator name='logo' logo={logo} /> : null;
}

// No separator shows as a plain announcement.
const Megaphone = () => <LuMegaphone strokeWidth={2.25} />;

export function SeparatorMedia({ name }) {
  return (
    <span className='separator-tile' aria-hidden='true'>
      {name === 'none' ? (
        <Megaphone />
      ) : name === 'logo' ? (
        <LogoMedia />
      ) : (
        <AnnouncementSeparator name={name} />
      )}
    </span>
  );
}

const STEP = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1
};

// Tiles render the band's own separator component, so the Studio shows what ships.
export function SeparatorInput({
  value,
  onChange,
  readOnly,
  schemaType,
  elementProps
}) {
  const { id, ref: fieldRef, onFocus, onBlur } = elementProps;
  const logo = useSiteLogo(useClient({ apiVersion }));
  const tiles = useRef([]);
  const current = Math.max(
    0,
    SEPARATORS.findIndex((s) => s.value === value)
  );

  const pick = (i) => {
    if (SEPARATORS[i].value !== value) onChange(set(SEPARATORS[i].value));
  };

  const onKeyDown = (event) => {
    const step = STEP[event.key];
    if (!step || readOnly) return;
    event.preventDefault();
    const next = (current + step + SEPARATORS.length) % SEPARATORS.length;
    pick(next);
    tiles.current[next]?.focus();
  };

  return (
    <Grid
      role='radiogroup'
      aria-label={schemaType.title}
      columns={[3, 4, 6]}
      gap={2}
      onKeyDown={onKeyDown}>
      {SEPARATORS.map((separator, i) => {
        const selected = i === current;
        const glyph = separator.value !== 'logo' || logo;
        return (
          <Card
            key={separator.value}
            // the field's focus target and label are the checked tile
            ref={(el) => {
              tiles.current[i] = el;
              if (!selected) return;
              if (typeof fieldRef === 'function') fieldRef(el);
              else if (fieldRef) fieldRef.current = el;
            }}
            id={selected ? id : undefined}
            as='button'
            type='button'
            role='radio'
            aria-checked={selected}
            aria-label={separator.title}
            tabIndex={selected ? 0 : -1}
            disabled={readOnly}
            onClick={() => pick(i)}
            onFocus={onFocus}
            onBlur={onBlur}
            padding={3}
            radius={2}
            border
            tone={selected ? 'primary' : 'default'}
            selected={selected}
            __unstable_focusRing>
            <Stack space={3}>
              <span className='separator-tile' aria-hidden='true'>
                {separator.value === 'none' ? (
                  <Megaphone />
                ) : (
                  glyph && (
                    <AnnouncementSeparator name={separator.value} logo={logo} />
                  )
                )}
              </span>
              <Text size={0} align='center' muted={!selected}>
                {separator.title}
              </Text>
            </Stack>
          </Card>
        );
      })}
    </Grid>
  );
}
