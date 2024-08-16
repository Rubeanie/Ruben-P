// documents
import { announcement } from './documents/announcement';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { redirect } from './documents/redirect';
import { site } from './documents/site';
import { theme } from './documents/theme';

// modules
import { accordionList } from './modules/accordion-list';
import { customHtml } from './modules/custom-html';
import { hero } from './modules/hero';
import { richtextModule } from './modules/richtext-module';

// objects
import { cta } from './objects/cta';
import { link } from './objects/link';
import { metadata } from './objects/metadata';
import { style } from './objects/style';
import { uid } from './objects/uid';

export const schemaTypes = [
  // documents
  announcement,
  navigation,
  page,
  redirect,
  site,
  theme,

  // modules
  accordionList,
  customHtml,
  hero,
  richtextModule,

  // objects
  cta,
  link,
  metadata,
  style,
  uid
];