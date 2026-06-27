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
  environmentSource,
  environmentPreset,
  environment,
  environmentBackground,
  keyLight,
  orbitControls,
  zoom
}) {
  // Re-enable pointer events for interactive orbit (Canvas defaults to none).
  const style = {
    pointerEvents: orbitControls ? 'auto' : 'none'
  };

  return (
    <Canvas className={styles.canvas} style={style}>
      {model && <Model url={model} />}
      {/* Key light for form — flat image environments light too evenly. */}
      {keyLight && <directionalLight position={[3, 4, 5]} intensity={1.2} />}
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
