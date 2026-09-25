import { fetchSanity, groq } from '../fetch';
import { navigationQuery } from './navigation';
import { seoQuery } from './metadata';
import { themesQuery } from './fragments/themes';
import { announcementQuery } from './fragments/announcement';
import { themeFromImage } from '@/lib/imageTheme';

export async function getSite() {
  const site = await fetchSanity(
    groq`
			*[_type == 'site'][0]{
				title,
				logo,
				headerMenu->{ ${navigationQuery} },
				footerMenu->{ ${navigationQuery} },
				announcements[]->{ ${announcementQuery} },
        ${seoQuery}
			}
		`,
    { tags: ['site'] }
  );

  if (!site) throw new Error("Missing 'site' document in Sanity Studio");

  return site;
}

export async function getThemes() {
  const site = await fetchSanity(
    groq`
			*[_type == 'site'][0]{
        ${themesQuery}
			}
		`,
    { tags: ['theme'] }
  );

  if (
    !site?.themes ||
    !Array.isArray(site.themes) ||
    site.themes.length === 0
  ) {
    return [];
  }

  // the site theme and a hero photo derive their colours the same way
  return Promise.all(
    site.themes.map(async (style) => {
      const hasColors = [
        'primaryColor',
        'secondaryColor',
        'backgroundColor',
        'textColor'
      ].some((key) => style[key]);

      if (!style.image || hasColors) {
        return style;
      }

      const colors = await themeFromImage(style.image);

      return colors
        ? {
            ...style,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
            backgroundColor: colors.background,
            textColor: colors.text
          }
        : style;
    })
  );
}
