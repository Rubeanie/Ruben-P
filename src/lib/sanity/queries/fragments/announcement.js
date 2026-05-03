import { groq } from '../../fetch';
import { contentQuery } from './content';
import { linkQuery } from './link';

export const announcementQuery = groq`
  content[]{ ${contentQuery} },
  cta { ${linkQuery} },
  start,
  end
`;
