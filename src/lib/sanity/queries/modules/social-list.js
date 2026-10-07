import { groq } from '../../fetch';

export const socialListQuery = groq`
  maxColumns,
  socials[]->{
    _id,
    title,
    username,
    logo,
    baseColor { hex, rgb { r, g, b, a } },
    redirect->{
      source,
      destination{ type, params, internal->{ metadata { "slug": slug.current } } }
    }
  }
`;
