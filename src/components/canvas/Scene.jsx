'use client';

import { useEffect, useState } from 'react';
import { Canvas, addEffect } from '@react-three/fiber';
import { PerformanceMonitor, Preload, View } from '@react-three/drei';
import round from 'lodash/round';
import Lenis from '@studio-freight/lenis';
import { usePathname } from 'next/navigation';

export default function Scene(props) {
  const [dpr, setDpr] = useState(0.9);
  const pathname = usePathname();

  // Use lenis to control scrolling if URL does not start with admin
  useEffect(() => {
    if (!pathname.startsWith('/admin')) {
      const lenis = new Lenis({
        smoothWheel: true,
        syncTouch: true,
        duration: 0.6
      });
      const removeEffect = addEffect((time) => lenis.raf(time));
      return () => {
        lenis.destroy();
        removeEffect();
      };
    }
  }, [pathname]);

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
