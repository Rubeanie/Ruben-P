// documents
import { blockContentType } from './documents/blockContentType';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { redirect } from './documents/redirect';
import { site } from './documents/site';
import { theme } from './documents/theme';

// modules
import { customHtml } from './modules/custom-html';

// objects
import { link } from './objects/link';
import { metadata } from './objects/metadata';
import { style } from './objects/style';
import { uid } from './objects/uid';

export const schemaTypes = [
  // documents
  blockContentType,
  navigation,
  page,
  redirect,
  site,
  theme,

  // modules
  customHtml,

  // objects
  link,
  metadata,
  style,
  uid
];