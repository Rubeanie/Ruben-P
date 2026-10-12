import { groq } from '../../fetch';
import { contentQuery } from './content';
import { linkQuery } from './link';

export const announcementQuery = groq`
  _id,
  content[]{ ${contentQuery} },
  link { ${linkQuery} },
  marquee,
  separator,
  start,
  end
`;
