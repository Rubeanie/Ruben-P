// documents
import { blockContentType } from './documents/blockContentType';
import { site } from './documents/site';
import { theme } from './documents/theme';

// objects
import { style } from './objects/styleType';

// modules

export const schema = {
  types: [
    // documents
    blockContentType,
    site,
    theme,

    // objects
    style,

    // modules
  ]
};
