// documents
import { announcement } from './documents/announcement';
import { navigation } from './documents/navigation';
import { page } from './documents/page';
import { pagePortfolio } from './documents/page.portfolio';
import { portfolioCategory } from './documents/portfolio.category';
import { redirect } from './documents/redirect';
import { site } from './documents/site';
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
import { portfolioList } from './modules/portfolio-list';
import { richtextModule } from './modules/richtext-module';
import { socialList } from './modules/social-list';
import { statList } from './modules/stat-list';

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
  pagePortfolio,
  portfolioCategory,
  redirect,
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
  portfolioList,
  richtextModule,
  socialList,
  statList,

  // objects
  cta,
  link,
  metadata,
  style,
  uid
];