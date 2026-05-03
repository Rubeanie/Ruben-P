import { groq } from '../../fetch';

export const imageQuery = groq`
  asset->{
    _id,
    url,
    metadata {
      dimensions { width, height, aspectRatio },
      lqip
    }
  },
  hotspot { x, y, width, height },
  crop { top, bottom, left, right }
`;
