'use client';

import { Suspense } from 'react';
import Canvas from '@/components/canvas/Canvas';
import Model from '@/components/canvas/Model';
import Common from '@/components/canvas/Common';
import SceneEnvironment from '@/components/canvas/SceneEnvironment';
import styles from '@/styles/components/ThreeScene.module.scss';

export default function Scene({
  model,
  background,
  lights,
  height,
  width,
  environmentSource,
  environmentPreset,
  environment,
  environmentBackground,
  orbitControls,
  zoom
}) {
  // Inline styles win over the .canvas class, so height/width override the CSS
  // defaults only when the CMS sets them. Canvas defaults to pointerEvents:'none';
  // re-enable them when the scene has interactive orbit controls.
  const style = {
    pointerEvents: orbitControls ? 'auto' : 'none',
    ...(height && { height }),
    ...(width && { width })
  };

  return (
    <Canvas className={styles.canvas} style={style}>
      {model && <Model url={model} />}
      {/* Own Suspense so the HDRI loads independently of the model — the model
          (gated by Canvas's boundary + the loader) shows as soon as it's ready
          instead of waiting on the environment. */}
      <Suspense fallback={null}>
        <SceneEnvironment
          source={environmentSource}
          preset={environmentPreset}
          url={environment}
          background={environmentBackground}
        />
      </Suspense>
      <Common
        color={background}
        lights={lights}
        controls={orbitControls}
        enableZoom={zoom}
      />
    </Canvas>
  );
}
