'use client';

import { Suspense, useState } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { ToneMappingMode } from 'postprocessing';
import Canvas from '@/components/canvas/Canvas';
import Model from '@/components/canvas/Model';
import SceneEnvironment from '@/components/canvas/SceneEnvironment';
import PostFx, { BLOOM, GRAIN } from '@/components/canvas/effects/PostFx';
import styles from '@/styles/components/ThreeScene.module.scss';

const VIGNETTE = 0.3;
// The canvas's own antialiasing, which a composer bypasses.
const SAMPLES = 4;

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
  bloom,
  grain,
  vignette,
  orbitControls,
  zoom,
  onReady
}) {
  // Once frames still run slow at the lowest density, the glow stays off.
  const [shed, setShed] = useState(false);
  const glow = BLOOM[bloom];
  const composed = glow !== undefined && !shed;
  const transparent = !(environmentSource && environmentBackground);
  // Re-enable pointer events for interactive orbit (Canvas defaults to none).
  const style = {
    pointerEvents: orbitControls ? 'auto' : 'none'
  };

  return (
    <Canvas
      className={styles.gl}
      style={style}
      loader={false}
      onReady={onReady}
      onOverload={() => setShed(true)}>
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
      {/* The composer lays the colour itself: it would tone map this one. */}
      {background && !composed && (
        <color attach='background' args={[background]} />
      )}
      {lights && <ambientLight color={lights} intensity={1} />}
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
      {orbitControls && <OrbitControls makeDefault enableZoom={zoom} />}
      {/* ACES is the canvas's own tone mapping without a composer. */}
      {composed && (
        <PostFx
          toneMapping={ToneMappingMode.ACES_FILMIC}
          transparent={transparent}
          backdrop={transparent ? background : undefined}
          bloom={glow}
          vignette={vignette ? VIGNETTE : undefined}
          grain={grain ? GRAIN : 0}
          multisampling={SAMPLES}
        />
      )}
    </Canvas>
  );
}
