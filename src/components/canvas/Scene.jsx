'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { ToneMappingMode } from 'postprocessing';
import Canvas from '@/components/canvas/Canvas';
import Model from '@/components/canvas/Model';
import SceneEnvironment from '@/components/canvas/SceneEnvironment';
import PostFx, { BLOOM, GRAIN } from '@/components/canvas/effects/PostFx';
import styles from '@/styles/components/ThreeScene.module.scss';

const GRAIN_LEVELS = { light: GRAIN, strong: GRAIN * 2 };
const VIGNETTE_LEVELS = { light: 0.4, strong: 0.75 };
// The canvas's own antialiasing, which a composer bypasses.
const SAMPLES = 4;

// While paused, lets the orbit's damping run out before the loop stops, then
// drops what is left of it, so the scene resumes at exactly this angle.
function Settle({ paused, onSettled }) {
  const controls = useThree((state) => state.controls);
  const moved = useRef(true);

  useEffect(() => {
    if (!controls) return;
    const onChange = () => (moved.current = true);
    controls.addEventListener('change', onChange);
    return () => controls.removeEventListener('change', onChange);
  }, [controls]);

  // Runs after the controls' own update, which reports any movement as a change.
  useFrame(({ controls }) => {
    if (!paused) return;
    if (!moved.current) {
      if (controls) {
        // Undamped, an update spends the whole remaining delta and clears it.
        controls.enableDamping = false;
        controls.update();
        controls.enableDamping = true;
      }
      onSettled();
    }
    moved.current = false;
  });
  return null;
}

// Reports a context the browser took back (too many canvases, a GPU reset);
// unsubscribed before an unmount's own deliberate loss.
function WatchContext({ onLost }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    if (!onLost) return;
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl, onLost]);
  return null;
}

// Camera and controls live here: the hero keeps its own set and the two are
// free to diverge.
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
  onReady,
  paused = false,
  onLost,
  ...canvasProps
}) {
  // Once frames still run slow at the lowest density, the composer, so glow, grain and vignette, stays off.
  const [shed, setShed] = useState(false);
  // Paused and settled, the loop stops: the canvas keeps its last frame and the
  // performance monitor unmounts rather than read the gap as slow frames.
  const [settled, setSettled] = useState(false);
  if (settled && !paused) setSettled(false);
  const glow = BLOOM[bloom];
  const grainAmount = GRAIN_LEVELS[grain];
  const vignetteAmount = VIGNETTE_LEVELS[vignette];
  const composed = (glow || grainAmount || vignetteAmount) && !shed;
  const transparent = !(environmentSource && environmentBackground);
  // Re-enable pointer events for interactive orbit (Canvas defaults to none).
  const style = {
    pointerEvents: orbitControls ? 'auto' : 'none'
  };

  return (
    <Canvas
      className={styles.gl}
      style={style}
      onReady={onReady}
      onOverload={() => setShed(true)}
      frameloop={paused && settled ? 'never' : undefined}
      // Layout size, not the projected one: a canvas under a CSS transform
      // would otherwise resize, and clear, as the page scrolls.
      resize={{ offsetSize: true }}
      {...canvasProps}>
      <Settle paused={paused} onSettled={() => setSettled(true)} />
      <WatchContext onLost={onLost} />
      {model && <Model url={model} />}
      {/* Key light for form: flat image environments light too evenly. */}
      {keyLight && <directionalLight position={[3, 4, 5]} intensity={1.2} />}
      {/* Own Suspense so the HDRI loads independently of the model: the model
          (gated by Canvas's boundary) shows as soon as it's ready
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
          vignette={vignetteAmount}
          grain={grainAmount}
          multisampling={SAMPLES}
        />
      )}
    </Canvas>
  );
}
