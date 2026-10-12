import { stegaClean } from '@sanity/client/stega';
import { fetchSanity } from '@/lib/sanity/fetch';
import {
  shareImagePageQuery,
  shareImageSiteQuery,
  shareImageSocialQuery
} from '@/lib/sanity/queries/share-image';
import { baseUrl } from '@/lib/env';
import { themeFromImage } from '@/lib/imageTheme';
import { sanitizeLogo } from '@/lib/cachedLogo';
import { heroThemeImage } from '@/lib/resolveMetadata';
import { DEFAULT_THEME_COLORS } from '@/lib/themes';
import { mix, ringColour, sharePhoto, socialColours } from './colours';
import { cardText, pathLine } from './copy';

export async function getVanitySocial(path) {
  return stegaClean(
    await fetchSanity(shareImageSocialQuery, {
      params: { path },
      tags: ['socials']
    })
  );
}

async function colours(page, photo, social) {
  if (social) {
    const brand = social.baseColor || DEFAULT_THEME_COLORS.primary;
    const { accent, ink, ground } = socialColours(brand);
    return {
      theme: {
        ...DEFAULT_THEME_COLORS,
        background: ground,
        primary: accent,
        secondary: mix(brand, 40, ground)
      },
      ring: accent,
      markInk: ink
    };
  }
  // The page's own theme, by the same call the page route makes for its bar colour.
  const hero = heroThemeImage(page);
  const theme = (hero && (await themeFromImage(hero))) ?? DEFAULT_THEME_COLORS;
  return { theme, ring: ringColour(photo, theme) };
}

// Everything the card draws for a path, or null when nothing is shared there.
export async function getShareCard(path) {
  const [page, site] = stegaClean(
    await Promise.all([
      fetchSanity(shareImagePageQuery, {
        params: { path },
        tags: ['pages', 'posts']
      }),
      fetchSanity(shareImageSiteQuery, { tags: ['site'] })
    ])
  );
  const social = !page && (await getVanitySocial(path));
  if (!page && !social) return null;
  const photo = social ? null : sharePhoto(page);
  return {
    id: (page ?? social)._id,
    path: pathLine(new URL(baseUrl).host, path),
    ...cardText({ page, social, site, path }),
    photo,
    ...(await colours(page, photo, social)),
    logo: await sanitizeLogo(site.logo),
    socialLogo: social?.logo ? await sanitizeLogo(social.logo) : null
  };
}
