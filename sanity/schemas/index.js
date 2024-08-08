// documents
import { blockContentType } from './documents/blockContentType';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { redirect } from './documents/redirect';
import { site } from './documents/site';
import { theme } from './documents/theme';

// objects
import { link } from './objects/link';
import { metadata } from './objects/metadata';
import { style } from './objects/styleType';
import { uid } from './objects/uid';

// modules

export const schema = {
  types: [
    // documents
    blockContentType,
    navigation,
    page,
    redirect,
    site,
    theme,

    // objects
    link,
    metadata,
    style,
    uid

    // modules
  ]
};
