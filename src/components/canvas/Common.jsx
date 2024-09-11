'use client';

import { useState, useEffect } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import dynamic from 'next/dynamic';

const Perf = dynamic(() => import('r3f-perf').then((mod) => mod.Perf), {
  ssr: false
});

export default function Common({
  color,
  lights,
  controls,
  enableZoom = false
}) {
  const [perf, setPerf] = useState(false);

  useEffect(() => {
    function performanceMonitor(enable) {
      setPerf(enable === true);
      return `Performance Monitor: ${enable}`;
    }
    window.performanceMonitor = performanceMonitor;
  }, []);

  return (
    <>
      {color && <color attach='background' args={[color]} />}
      {lights && <ambientLight color={lights} intensity={1} />}
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
      {controls && <OrbitControls enableZoom={enableZoom} />}
      {perf && <Perf position={'bottom-right'} />}
    </>
  );
}
