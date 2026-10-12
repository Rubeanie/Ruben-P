import { Card, Flex, Stack, Text } from '@sanity/ui';
import { LuMenu } from 'react-icons/lu';
import { INKS } from '@/lib/posts';
import { useClient } from 'sanity';
import { apiVersion } from '@/lib/env';
import { useSiteLogo } from '../useSiteLogo';
import { COLOR_FIELDS, useImageColors } from '../imageColors';
import { DEFAULT_THEME_COLORS, portraitRendition } from '@/lib/themes';

const pill = { borderRadius: 999, padding: '3px 10px', fontSize: 10 };

// Ground, photo laid over it at 35% (as the site does), and a padded column.
function Frame({ src, colors, radius, pad, style, children }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        background: colors.background,
        color: colors.text,
        textAlign: 'center',
        fontFamily: 'inherit',
        ...style
      }}>
      {src && (
        <img
          src={src}
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
          padding: pad,
          boxSizing: 'border-box'
        }}>
        {children}
      </div>
    </div>
  );
}

function Navbar({ logo, logoHeight = 14, children }) {
  return (
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
          style={{ display: 'block', height: logoHeight }}
          dangerouslySetInnerHTML={{ __html: logo }}
        />
      ) : (
        <span style={{ height: logoHeight }} />
      )}
      {children}
    </div>
  );
}

function ThemeMock({ url, colors, title, message }) {
  const logo = useSiteLogo(useClient({ apiVersion }));
  return (
    <Frame
      src={url}
      colors={colors}
      radius={12}
      pad={10}
      style={{ aspectRatio: '16 / 9' }}>
      <Navbar logo={logo}>
        <span style={{ ...pill, background: colors.primary, color: INKS.dark }}>
          Contact
        </span>
      </Navbar>
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
        <span style={{ color: colors.primary, fontWeight: 600 }}>Latest</span> A
        card on the secondary colour
      </div>
    </Frame>
  );
}

const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines,
  overflow: 'hidden'
});

// What a portrait phone paints: the 3:4 crop, covering a tall screen.
function PhoneMock({ url, colors, title, message }) {
  const logo = useSiteLogo(useClient({ apiVersion }));
  return (
    <Stack space={2} style={{ width: 110, flex: 'none' }}>
      <Frame
        src={url && portraitRendition(url)}
        colors={colors}
        radius={14}
        pad={6}
        style={{ aspectRatio: '9 / 19.5' }}>
        <Navbar logo={logo} logoHeight={9}>
          <LuMenu size={11} style={{ marginRight: 6 }} />
        </Navbar>
        <div
          style={{
            margin: 'auto 0',
            display: 'grid',
            gap: 4,
            maxWidth: '100%'
          }}>
          <div
            style={{
              ...clamp(3),
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}>
            {title || 'Untitled style'}
          </div>
          <div style={{ ...clamp(3), fontSize: 8, opacity: 0.8 }}>
            {message || 'A line of body text over the photo.'}
          </div>
          <span
            style={{
              ...pill,
              justifySelf: 'center',
              padding: '2px 8px',
              fontSize: 8,
              background: colors.primary,
              color: INKS.dark
            }}>
            View work
          </span>
        </div>
      </Frame>
      <Text size={0} muted align='center'>
        Phone
      </Text>
    </Stack>
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
    <Card radius={3} style={{ maxWidth: 560 }}>
      <Stack space={2}>
        <Flex gap={3} align='flex-start' wrap='wrap'>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <ThemeMock
              url={url}
              colors={colors}
              title={value?.title}
              message={value?.message}
            />
          </div>
          <PhoneMock
            url={url}
            colors={colors}
            title={value?.title}
            message={value?.message}
          />
        </Flex>
        <Text size={0} muted>
          Rough preview. Blank colours show what the site fills in from the
          image.
        </Text>
      </Stack>
    </Card>
  );
}
