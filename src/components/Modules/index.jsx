import React from 'react';
import { createDataAttribute } from 'next-sanity';
import { draftMode } from 'next/headers';
import { LuCircleAlert, LuTriangleAlert } from 'react-icons/lu';
import AccordionList from './AccordionList';
import Breadcrumbs from './Breadcrumbs';
import Callout from './Callout';
import CreativeModule from './CreativeModule';
import CustomHTML from './CustomHTML';
import PostDetails from './PostDetails';
import PostFeatured from './PostFeatured';
import PostList from './PostList';
import Hero from './Hero';
import HeroGlass from './HeroGlass';
import HeroSplit from './HeroSplit';
import Hero3D from './Hero3D';
import MediaCarousel from './MediaCarousel';
import RichtextModule from './RichtextModule';
import SkillList from './SkillList';
import SocialList from './SocialList';
import Spacer from './Spacer';
import StatList from './StatList';
import TableOfContents from './TableOfContents';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../ErrorBoundary';
import { anchors } from '@/lib/anchors';
import { firstModule } from '@/lib/modules';
import { railedModules, tocEntries } from '@/lib/toc';

const ModuleRenderer = ({
  module,
  page,
  dataAttribute,
  isFirstModule,
  entries,
  besideRail
}) => {
  switch (module._type) {
    case 'accordion-list':
      return <AccordionList {...module} dataAttribute={dataAttribute} />;
    case 'breadcrumbs':
      return <Breadcrumbs {...module} page={page} />;
    case 'callout':
      return <Callout {...module} values={page?.values} />;
    case 'creative-module':
      return (
        <CreativeModule
          {...module}
          values={page?.values}
          dataAttribute={dataAttribute}
        />
      );
    case 'custom-html':
      return <CustomHTML {...module} />;
    case 'post-details':
      return <PostDetails {...module} page={page} />;
    case 'post-featured':
      return <PostFeatured {...module} page={page} />;
    case 'post-list':
      return <PostList {...module} page={page} />;
    case 'hero':
      return <Hero {...module} />;
    case 'hero.saas':
      return <HeroGlass {...module} />;
    case 'hero.split':
      return <HeroSplit {...module} />;
    case 'hero.3d':
      return <Hero3D {...module} />;
    case 'media-carousel':
      return (
        <MediaCarousel
          {...module}
          isFirstModule={isFirstModule}
          besideRail={besideRail}
        />
      );
    case 'richtext-module':
      return (
        <RichtextModule
          {...module}
          values={page?.values}
          dataAttribute={dataAttribute}
          isFirstModule={isFirstModule}
        />
      );
    case 'skill-list':
      return <SkillList {...module} />;
    case 'social-list':
      return <SocialList {...module} />;
    case 'spacer':
      return <Spacer {...module} />;
    case 'stat-list':
      return <StatList {...module} dataAttribute={dataAttribute} />;
    case 'table-of-contents':
      return <TableOfContents {...module} entries={entries} />;
    case 'three.js':
      return <ThreeScene {...module} />;
    default:
      // Render errors are caught by the surrounding ErrorBoundary; an unknown
      // type isn't a throw, just a config mistake , show it inline.
      return (
        <div className='alert error' role='alert'>
          <LuCircleAlert aria-hidden='true' />
          <span>
            <strong>Error: </strong>
            {`Data type mismatch, '${module._type}' does not exist`}
          </span>
        </div>
      );
  }
};

export async function Modules({ modules: fetched, page }) {
  const { modules, headings } = anchors(fetched, { links: page?.headingLinks });
  // In the Presentation tool each module gets a wrapper it can be opened from;
  // production markup stays untouched.
  const { isEnabled } = await draftMode();
  const sanity =
    isEnabled &&
    page?._id &&
    createDataAttribute({
      baseUrl: '/admin',
      id: page._id,
      type: page._type
    });
  const first = firstModule(modules);
  const railed = railedModules(modules, headings);
  return (
    <>
      {(modules ?? []).map((module, index) => {
        const scoped = sanity
          ? sanity.scope(`modules[_key=="${module._key}"]`)
          : undefined;
        const rendered = (
          <ErrorBoundary
            key={module._key}
            fallback={
              <div className='alert warning' role='alert'>
                <LuTriangleAlert aria-hidden='true' />
                <span>
                  <strong>Warning: </strong>
                  An error occurred while rendering this module. Please check
                  the module configuration.
                </span>
              </div>
            }>
            <ModuleRenderer
              module={module}
              page={page}
              dataAttribute={scoped}
              isFirstModule={module === first}
              besideRail={railed.has(module)}
              entries={
                module._type === 'table-of-contents'
                  ? tocEntries(headings, modules.slice(index + 1))
                  : undefined
              }
            />
          </ErrorBoundary>
        );
        return scoped ? (
          <div key={module._key} data-sanity={scoped.toString()}>
            {rendered}
          </div>
        ) : (
          rendered
        );
      })}
    </>
  );
}
