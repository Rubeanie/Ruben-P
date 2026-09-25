// documents
import { announcement } from './documents/announcement';
import { author } from './documents/author';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { pagePost } from './documents/page.post';
import { postCategory } from './documents/post.category';
import { redirect } from './documents/redirect';
import { site } from './documents/site';
import { skill } from './documents/skill';
import { social } from './documents/social';
import { theme } from './documents/theme';

// modules
import { accordionList } from './modules/accordion-list';
import { breadcrumbs } from './modules/breadcrumbs';
import { callout } from './modules/callout';
import { creativeModule } from './modules/creative';
import { customHtml } from './modules/custom-html';
import { hero } from './modules/hero';
import { heroSaas } from './modules/hero.saas';
import { heroSplit } from './modules/hero.split';
import { hero3d } from './modules/hero.3d';
import { postDetails } from './modules/post-details';
import { postList } from './modules/post-list';
import { postFeatured } from './modules/post-featured';
import { richtextModule } from './modules/richtext-module';
import { skillList } from './modules/skill-list';
import { socialList } from './modules/social-list';
import { statList } from './modules/stat-list';
import { threeJs } from './modules/three';

// objects
import { cta } from './objects/cta';
import { dynamicValue } from './objects/dynamic-value';
import { link } from './objects/link';
import { style } from './objects/style';
import { uid } from './objects/uid';

export const schemaTypes = [
  // documents
  announcement,
  author,
  navigation,
  page,
  pagePost,
  postCategory,
  redirect,
  skill,
  site,
  social,
  theme,

  // modules
  accordionList,
  breadcrumbs,
  callout,
  creativeModule,
  customHtml,
  hero,
  heroSaas,
  heroSplit,
  hero3d,
  postDetails,
  postList,
  postFeatured,
  richtextModule,
  skillList,
  socialList,
  statList,
  threeJs,

  // objects
  cta,
  dynamicValue,
  link,
  style,
  uid
];
