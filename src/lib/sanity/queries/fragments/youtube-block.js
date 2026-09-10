import { groq } from '../../fetch';

export const youtubeBlockQuery = groq`
  url,
  autoplay,
  controls,
  size,
  align
`;
