import { groq } from '../../fetch';
import { heroQuery } from './hero';
import { heroSaasQuery } from './hero-saas';
import { heroSplitQuery } from './hero-split';
import { richtextModuleQuery } from './richtext-module';
import { accordionListQuery } from './accordion-list';
import { calloutQuery } from './callout';
import { statListQuery } from './stat-list';
import { skillListQuery } from './skill-list';
import { socialListQuery } from './social-list';
import { postListQuery } from './post-list';
import { postDetailsQuery } from './post-details';
import { postFeaturedQuery } from './post-featured';
import { threeSceneQuery } from './three-scene';
import { creativeModuleQuery } from './creative-module';
import { breadcrumbsQuery } from './breadcrumbs';
import { customHtmlQuery } from './custom-html';

export const modulesQuery = groq`
  _type,
  _key,
  _type == 'hero' => { ${heroQuery} },
  _type == 'hero.saas' => { ${heroSaasQuery} },
  _type == 'hero.split' => { ${heroSplitQuery} },
  _type == 'richtext-module' => { ${richtextModuleQuery} },
  _type == 'accordion-list' => { ${accordionListQuery} },
  _type == 'callout' => { ${calloutQuery} },
  _type == 'stat-list' => { ${statListQuery} },
  _type == 'skill-list' => { ${skillListQuery} },
  _type == 'social-list' => { ${socialListQuery} },
  _type == 'post-list' => { ${postListQuery} },
  _type == 'post-details' => { ${postDetailsQuery} },
  _type == 'post-featured' => { ${postFeaturedQuery} },
  _type == 'three.js' => { ${threeSceneQuery} },
  _type == 'creative-module' => { ${creativeModuleQuery} },
  _type == 'breadcrumbs' => { ${breadcrumbsQuery} },
  _type == 'custom-html' => { ${customHtmlQuery} },
`;
