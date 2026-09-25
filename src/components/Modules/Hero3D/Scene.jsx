'use client';

import { useEffect, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import { NeutralToneMapping } from 'three';
import Canvas from '@/components/canvas/Canvas';
import Common from '@/components/canvas/Common';
import Rig from './Rig';
import styles from '@/styles/components/Hero3D.module.scss';

// Neutral tone mapping keeps the counter's glow in the theme's hue; ACES
// bleaches bright highlights towards white. frameloop overrides the canvas's
// own on-screen check: the layer is fixed, so the stage decides when drawing
// stops.
const GL = {
  precision: 'lowp',
  powerPreference: 'high-performance',
  toneMapping: NeutralToneMapping
};

// The full-screen hero draws at the screen's own density, up to 2x, and only
// steps down (to 1x at most) while frames actually run slow, back up when they
// recover. It overrides the shared canvas's generic 0.5-1.1 range.
const top = () => Math.max(1, Math.min(devicePixelRatio, 2));

export default function Scene({ frameloop, progress, vignette, onReady }) {
  const [max, setMax] = useState(top);
  const [load, setLoad] = useState(1);
  // Re-read when the density changes: a window dragged to another screen, zoom.
  useEffect(() => {
    const query = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    const change = () => setMax(top());
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, [max]);
  const dpr = Math.round((1 + (max - 1) * load) * 100) / 100;

  return (
    <Canvas
      className={styles.fill}
      loader={false}
      onReady={onReady}
      frameloop={frameloop}
      gl={GL}
      dpr={dpr}>
      <PerformanceMonitor
        factor={1}
        step={0.1}
        onChange={({ factor }) => setLoad(factor)}
      />
      <Rig progress={progress} vignette={vignette} />
      <Common />
    </Canvas>
  );
}
