// documents
import { blockContentType } from './documents/blockContentType';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { site } from './documents/site';
import { theme } from './documents/theme';

// objects
import { link } from './objects/link';
import { style } from './objects/styleType';

// modules

export const schema = {
  types: [
    // documents
    blockContentType,
    navigation,
    page,
    site,
    theme,

    // objects
    link,
    style,

    // modules
  ]
};
