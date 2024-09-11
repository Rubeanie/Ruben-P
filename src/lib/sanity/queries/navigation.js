import { groq } from '../fetch';
import { linkQuery } from './fragments/link';

export const navigationQuery = groq`
	title,
	items[]{
		${linkQuery},
		link{ ${linkQuery} },
		links[]{ ${linkQuery} }
	}
`;
