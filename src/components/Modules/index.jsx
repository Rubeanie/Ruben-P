import React from 'react';
import CustomHTML from './CustomHTML';
import RichtextModule from './RichtextModule';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../ErrorBoundary';

const ModuleRenderer = ({ module, page }) => {
  switch (module._type) {
    case 'custom-html':
      return <CustomHTML {...module} />;
    case 'richtext-module':
      return <RichtextModule {...module} values={page?.values} />;
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
  return (
    <>
      {modules.map((module) => (
        <ErrorBoundary
          key={module._key}
          fallback={
            <div className='alert warning' role='alert'>
              <strong>Warning: </strong>
              <span>
                An error occurred while rendering this module. Please check the
                module configuration.
              </span>
            </div>
          }>
          <ModuleRenderer module={module} page={page} />
        </ErrorBoundary>
      ))}
    </>
  );
}
