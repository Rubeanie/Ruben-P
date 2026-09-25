import React from 'react';
import { createDataAttribute } from 'next-sanity';
import { draftMode } from 'next/headers';
import AccordionList from './AccordionList';
import Breadcrumbs from './Breadcrumbs';
import CustomHTML from './CustomHTML';
import PostDetails from './PostDetails';
import PostFeatured from './PostFeatured';
import PostList from './PostList';
import Hero from './Hero';
import HeroGlass from './HeroGlass';
import HeroSplit from './HeroSplit';
import Hero3D from './Hero3D';
import RichtextModule from './RichtextModule';
import SkillList from './SkillList';
import SocialList from './SocialList';
import StatList from './StatList';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../ErrorBoundary';

const ModuleRenderer = ({ module, page, dataAttribute }) => {
  switch (module._type) {
    case 'accordion-list':
      return <AccordionList {...module} dataAttribute={dataAttribute} />;
    case 'breadcrumbs':
      return <Breadcrumbs {...module} page={page} />;
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
    case 'richtext-module':
      return (
        <RichtextModule
          {...module}
          values={page?.values}
          dataAttribute={dataAttribute}
        />
      );
    case 'skill-list':
      return <SkillList {...module} />;
    case 'social-list':
      return <SocialList {...module} />;
    case 'stat-list':
      return <StatList {...module} dataAttribute={dataAttribute} />;
    case 'three.js':
      return <ThreeScene {...module} />;
    default:
      // Render errors are caught by the surrounding ErrorBoundary; an unknown
      // type isn't a throw, just a config mistake , show it inline.
      return (
        <div className='alert error' role='alert'>
          <strong>Error: </strong>
          <span>{`Data type mismatch, '${module._type}' does not exist`}</span>
        </div>
      );
  }
};

export async function Modules({ modules, page }) {
  // In the Presentation tool each module gets a wrapper it can be opened from;
  // production markup stays untouched.
  const { isEnabled } = await draftMode();
  const sanity =
    isEnabled &&
    page?._id &&
    createDataAttribute({ baseUrl: '/admin', id: page._id, type: 'page' });
  return (
    <>
      {modules.map((module) => {
        const scoped = sanity
          ? sanity.scope(`modules[_key=="${module._key}"]`)
          : undefined;
        const rendered = (
          <ErrorBoundary
            key={module._key}
            fallback={
              <div className='alert warning' role='alert'>
                <strong>Warning: </strong>
                <span>
                  An error occurred while rendering this module. Please check
                  the module configuration.
                </span>
              </div>
            }>
            <ModuleRenderer
              module={module}
              page={page}
              dataAttribute={scoped}
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
