import { fetchSanity, groq } from '../fetch';
import { metadataQuery } from './metadata';
import { seo } from './metadata';

export const linkQuery = groq`
  ...,
  internal->{ _type, title, ${metadataQuery} }
`;

const navigationQuery = groq`
	title,
	items[]{
		${linkQuery},
		link{ ${linkQuery} },
		links[]{ ${linkQuery} }
	}
`;

export const ctaQuery = groq`
	...,
	link{ ${linkQuery} }
`;

export const ctaaQuery = groq`
			*[_type == 'site'][0]{
				...,
				headerMenu->{ ${navigationQuery} },
				footerMenu->{ ${navigationQuery} },
        metadata->{ ${seo} }
			}
`;

export async function getSite() {
	const site = await fetchSanity(
		groq`
			*[_type == 'site'][0]{
				...,
				headerMenu->{ ${navigationQuery} },
				footerMenu->{ ${navigationQuery} },
        metadata->{ ${seo} }
			}
		`,
		{ tags: ['site'] },
	)

	if (!site) throw new Error("Missing 'site' document in Sanity Studio")

	return site
}