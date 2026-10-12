'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { ToneMappingMode } from 'postprocessing';
import { NeutralToneMapping } from 'three';
import Canvas from '@/components/canvas/Canvas';
import PostFx, { BLOOM, GRAIN } from '@/components/canvas/effects/PostFx';
import useReducedMotion from '@/lib/useReducedMotion';
import Rig from './Rig';
import styles from '@/styles/components/Hero3D.module.scss';

// Neutral tone mapping keeps the counter's glow in the theme's hue; ACES
// bleaches bright highlights towards white. The composer turns the renderer's
// off and maps in its own chain instead. frameloop overrides the canvas's own
// on-screen check: the layer is fixed, so the stage decides when drawing stops.
const GL = {
  precision: 'lowp',
  powerPreference: 'high-performance',
  toneMapping: NeutralToneMapping
};

// The full-screen hero draws at the screen's own density, up to 2x, and only
// steps down (to 1x at most) while frames actually run slow, back up when they
// recover. It overrides the shared canvas's generic 0.5-1.1 range.
const top = (ratio) => Math.max(1, Math.min(ratio, 2));

// Set once frames still run slow at the lowest density: the effects stay off from then on,
// across pages, rather than flip back on and slow down again.
let overloaded = false;

function Scene({ frameloop, progress, vignette, stage, grain, onReady }) {
  const [ratio, setRatio] = useState(() => devicePixelRatio);
  const [shed, setShed] = useState(overloaded);
  const reduced = useReducedMotion();
  // Re-read when the density changes: a window dragged to another screen, zoom.
  useEffect(() => {
    const query = matchMedia(`(resolution: ${ratio}dppx)`);
    const change = () => setRatio(devicePixelRatio);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, [ratio]);
  const max = top(ratio);
  const composed = !reduced && !shed;
  // Written by Rig every frame, read by the composer.
  const levels = useRef({ bloom: 0, travel: 0 });

  return (
    <Canvas
      className={styles.fill}
      // Any source turns off the inline pointer-events: auto R3F puts on its
      // div, so the layer never takes clicks meant for the page.
      eventSource={stage}
      onReady={onReady}
      // Held still, every frame is the same one: draw only when something changes.
      frameloop={reduced && frameloop === 'always' ? 'demand' : frameloop}
      composed={composed}
      gl={GL}
      dprRange={[1, max]}
      onOverload={() => {
        overloaded = true;
        setShed(true);
      }}>
      <Rig
        progress={progress}
        vignette={vignette}
        stage={stage}
        composed={composed}
        levels={levels}
      />
      {composed && (
        <PostFx
          transparent
          toneMapping={ToneMappingMode.NEUTRAL}
          bloom={{ ...BLOOM.medium, level: () => levels.current.bloom }}
          grain={grain ? GRAIN : 0}
          grainTime={() => levels.current.travel}
        />
      )}
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
    </Canvas>
  );
}

const noSubscribe = () => () => {};

// Nothing on the server or while hydrating: the canvas only mounts in the browser.
export default function ClientScene(props) {
  const client = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  );
  return client && <Scene {...props} />;
}
