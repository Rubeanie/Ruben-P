import { fetchSanity, groq } from '../fetch';
import { navigationQuery } from './navigation';
import { seoQuery } from './metadata';
import { themesQuery } from './fragments/themes';

export async function getSite() {
  const site = await fetchSanity(
    groq`
			*[_type == 'site'][0]{
				...,
				headerMenu->{ ${navigationQuery} },
				footerMenu->{ ${navigationQuery} },
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
  
  if (!site?.themes || !Array.isArray(site.themes) || site.themes.length === 0) {
    return [];
  }

  return site.themes;
}