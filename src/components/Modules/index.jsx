import React from 'react';
import CustomHTML from './CustomHTML';
import ErrorBoundary from '../ErrorBoundary';

const ModuleRenderer = ({ module }) => {
  try {
    switch (module._type) {
      case 'custom-html':
        return <CustomHTML {...module} />;
      default:
        throw new Error(
          `Data type mismatch, '${module._type}' does not exist`
        );
    }
  } catch (error) {
    return (
      <div
        className='alert error'
        role='alert'>
        <strong>Error: </strong>
        <span>{error.message}</span>
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
            <div
              className='alert warning'
              role='alert'>
              <strong>Warning: </strong>
              <span>
                An error occurred while rendering this module. Please check the
                module configuration.
              </span>
            </div>
          }>
          <ModuleRenderer module={module} />
        </ErrorBoundary>
      ))}
    </>
  );
}
