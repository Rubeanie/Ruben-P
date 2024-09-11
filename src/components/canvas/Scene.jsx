'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload, View } from '@react-three/drei';
import round from 'lodash/round';

export default function Scene(props) {
  const [dpr, setDpr] = useState(0.9);

  return (
    <Canvas
      shadows
      gl={{
        precision: 'lowp',
        powerPreference: 'high-performance'
      }}
      dpr={dpr}
      eventSource={document.body}
      eventPrefix='client'
      {...props}>
      <View.Port />
      <Preload all />
      <PerformanceMonitor
        ms={200}
        iterations={7}
        step={0.05}
        factor={1}
        onChange={({ factor }) => setDpr(round(0.5 + 0.6 * factor, 2))}
      />
    </Canvas>
  );
}
