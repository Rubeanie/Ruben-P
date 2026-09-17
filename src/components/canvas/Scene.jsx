'use client';

import { Suspense } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Canvas from '@/components/canvas/Canvas';
import Model from '@/components/canvas/Model';
import SceneEnvironment from '@/components/canvas/SceneEnvironment';
import styles from '@/styles/components/ThreeScene.module.scss';

// Camera and controls live here rather than in Common: the hero keeps its own
// set there and the two are free to diverge.
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
  zoom,
  onReady
}) {
  // Re-enable pointer events for interactive orbit (Canvas defaults to none).
  const style = {
    pointerEvents: orbitControls ? 'auto' : 'none'
  };

  return (
    <Canvas
      className={styles.gl}
      style={style}
      loader={false}
      onReady={onReady}>
      {model && <Model url={model} />}
      {/* Key light for form: flat image environments light too evenly. */}
      {keyLight && <directionalLight position={[3, 4, 5]} intensity={1.2} />}
      {/* Own Suspense so the HDRI loads independently of the model: the model
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
      {background && <color attach='background' args={[background]} />}
      {lights && <ambientLight color={lights} intensity={1} />}
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
      {orbitControls && <OrbitControls makeDefault enableZoom={zoom} />}
    </Canvas>
  );
}
