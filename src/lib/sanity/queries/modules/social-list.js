import { groq } from '../../fetch';
import { redirectLinkQuery } from '../fragments/link';

export const socialListQuery = groq`
  maxColumns,
  socials[]->{
    _id,
    title,
    username,
    logo,
    baseColor { hex },
    redirect->{ ${redirectLinkQuery} }
  }
`;
