import { fetchSanity, groq } from '../fetch';
import { navigationQuery } from './navigation';
import { seoQuery } from './metadata';
import { linkQuery } from './fragments/link';
import { themesQuery } from './fragments/themes';
import { announcementQuery } from './fragments/announcement';
import { resolveLink } from '@/lib/processUrl';
import {
  themeFromImage,
  themeHasAllColors,
  fillThemeColors
} from '@/lib/imageTheme';

export async function getSite() {
  const site = await fetchSanity(
    groq`
			*[_type == 'site'][0]{
				title,
				alternateName,
				author->{ name, link { ${linkQuery} } },
				logo,
				headerMenu->{ ${navigationQuery} },
				footerMenu->{ ${navigationQuery} },
				"announcements": array::compact(announcements[]->{ ${announcementQuery} }),
        ${seoQuery},
        // Site-wide only: the layout emits them, no page carries its own.
        "additionalMetaTags": seo.additionalMetaTags[]{ name, value }
			}
		`
  );

  // A fresh dataset has no Site Settings yet; the site still builds, bare, so
  // the Studio can go live and fill them in.
  return site ?? {};
}

export async function getThemes() {
  const site = await fetchSanity(
    groq`
			*[_type == 'site'][0]{
        ${themesQuery}
			}
		`
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
    site.themes.map(async ({ artist, photoSource, ...row }) => {
      // The footer credits the artist behind the photo on screen, linked to their
      // own page when there is one, else to the photo's.
      const style = {
        ...row,
        credit: artist && {
          name: artist.name,
          href: resolveLink(artist.link) ?? photoSource
        }
      };
      if (!style.image || themeHasAllColors(style)) {
        return style;
      }

      const colors = await themeFromImage(style.image);
      return fillThemeColors(style, colors);
    })
  );
}
