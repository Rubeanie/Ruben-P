import { groq } from '../../fetch';
import { linkQuery } from '../fragments/link';
import { ctaQuery } from './cta';

export const modulesQuery = groq`
  ...,
  cta[] { ${ctaQuery} },
  _type == "breadcrumbs" => { crumbs[]{ ${linkQuery} } },
  _type == 'creative-module' => {
		modules[]{
			...,
			subModules[]{
				...,
				ctas[]{ ${ctaQuery} }
			}
		}
	},
`;
