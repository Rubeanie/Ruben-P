import { Card, Stack, Text } from '@sanity/ui';
import { INKS } from '@/lib/posts';
import { useClient } from 'sanity';
import { apiVersion } from '@/lib/env';
import { useSiteLogo } from '../useSiteLogo';
import { COLOR_FIELDS, useImageColors } from '../imageColors';
import { DEFAULT_THEME_COLORS } from '@/lib/themes';

const pill = { borderRadius: 999, padding: '3px 10px', fontSize: 10 };

function ThemeMock({ url, colors, title, message }) {
  const logo = useSiteLogo(useClient({ apiVersion }));
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        borderRadius: 12,
        background: colors.background,
        color: colors.text,
        textAlign: 'center',
        fontFamily: 'inherit'
      }}>
      {/* the site lays its photo over the ground at 35% */}
      {url && (
        <img
          src={url}
          alt=''
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 10,
          boxSizing: 'border-box'
        }}>
        <div
          style={{
            alignSelf: 'stretch',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 4px 4px 12px',
            borderRadius: 999,
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(8px)'
          }}>
          {logo ? (
            <span
              className='site-logo'
              style={{ display: 'block', height: 14 }}
              dangerouslySetInnerHTML={{ __html: logo }}
            />
          ) : (
            <span style={{ height: 14 }} />
          )}
          <span
            style={{ ...pill, background: colors.primary, color: INKS.dark }}>
            Contact
          </span>
        </div>
        <div style={{ margin: 'auto 0', display: 'grid', gap: 6 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}>
            {title || 'Untitled style'}
          </div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            {message || 'A line of body text over the photo.'}
          </div>
          <span
            style={{
              ...pill,
              justifySelf: 'center',
              marginTop: 4,
              background: colors.primary,
              color: INKS.dark
            }}>
            View work
          </span>
        </div>
        <div
          style={{
            width: '60%',
            padding: '6px 10px',
            borderRadius: 8,
            background: colors.secondary,
            fontSize: 10,
            textAlign: 'left'
          }}>
          <span style={{ color: colors.primary, fontWeight: 600 }}>Latest</span>{' '}
          A card on the secondary colour
        </div>
      </div>
    </div>
  );
}

export function ThemePreview({ url, value }) {
  const imageColors = useImageColors(url);
  const colors = Object.fromEntries(
    COLOR_FIELDS.map(({ key, field }) => [
      key,
      value?.[field]?.hex || imageColors?.[key] || DEFAULT_THEME_COLORS[key]
    ])
  );

  return (
    <Card radius={3} style={{ maxWidth: 480 }}>
      <Stack space={2}>
        <ThemeMock
          url={url}
          colors={colors}
          title={value?.title}
          message={value?.message}
        />
        <Text size={0} muted>
          Rough preview. Blank colours show what the site fills in from the
          image.
        </Text>
      </Stack>
    </Card>
  );
}
