import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { imageBlockQuery } from '../fragments/image-block';
import { linkQuery } from '../fragments/link';

export const creativeModuleQuery = groq`
  columns[]{
    _key,
    blocks[]{
      _key,
      _type,
      _type == 'icon' => { icon },
      _type == 'heading' => { text },
      _type == 'copy' => { content[]{ ${contentQuery} } },
      _type == 'imageBlock' => { ${imageBlockQuery} },
      _type == 'link' => { ${linkQuery} },
      _type == 'themeCycle' => { label },
      _type == 'themeImage' => { label }
    }
  }
`;
