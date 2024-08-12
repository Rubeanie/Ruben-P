'use client';

import { useEffect, useState } from 'react';
import { Canvas, addEffect } from '@react-three/fiber';
import { PerformanceMonitor, Preload, View } from '@react-three/drei';
import round from 'lodash/round';
import Lenis from 'lenis';

export default function Scene(props) {
  const [dpr, setDpr] = useState(0.9);

  // Use lenis to control scrolling
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: false,
      syncTouch: true,
      duration: 0.3
    });
    const removeEffect = addEffect((time) => lenis.raf(time));
    return () => {
      lenis.destroy();
      removeEffect();
    };
  }, []);

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
