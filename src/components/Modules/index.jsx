import React from 'react';
import { createDataAttribute } from 'next-sanity';
import { draftMode } from 'next/headers';
import Breadcrumbs from './Breadcrumbs';
import CustomHTML from './CustomHTML';
import RichtextModule from './RichtextModule';
import SocialList from './SocialList';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../ErrorBoundary';

const ModuleRenderer = ({ module, page, dataAttribute }) => {
  switch (module._type) {
    case 'breadcrumbs':
      return <Breadcrumbs {...module} page={page} />;
    case 'custom-html':
      return <CustomHTML {...module} />;
    case 'richtext-module':
      return (
        <RichtextModule
          {...module}
          values={page?.values}
          dataAttribute={dataAttribute}
        />
      );
    case 'social-list':
      return <SocialList {...module} />;
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
