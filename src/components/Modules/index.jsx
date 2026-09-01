import React from 'react';
import { createDataAttribute } from 'next-sanity';
import CustomHTML from './CustomHTML';
import RichtextModule from './RichtextModule';
import SocialList from './SocialList';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../ErrorBoundary';

const ModuleRenderer = ({ module, page }) => {
  switch (module._type) {
    case 'custom-html':
      return <CustomHTML {...module} />;
    case 'richtext-module':
      return <RichtextModule {...module} values={page?.values} />;
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

export function Modules({ modules, page }) {
  // Lets the Presentation tool open a module from anywhere inside it.
  const sanity =
    page?._id &&
    createDataAttribute({ baseUrl: '/admin', id: page._id, type: 'page' });
  return (
    <>
      {modules.map((module) => (
        <div
          key={module._key}
          data-sanity={
            sanity
              ? sanity(`modules[_key=="${module._key}"]`).toString()
              : undefined
          }>
          <ErrorBoundary
            fallback={
              <div className='alert warning' role='alert'>
                <strong>Warning: </strong>
                <span>
                  An error occurred while rendering this module. Please check
                  the module configuration.
                </span>
              </div>
            }>
            <ModuleRenderer module={module} page={page} />
          </ErrorBoundary>
        </div>
      ))}
    </>
  );
}
