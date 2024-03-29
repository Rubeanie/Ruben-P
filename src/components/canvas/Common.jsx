'use client';

import { useState, useEffect } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';

export default function Common ({ color, controls, enableZoom = false }) {
  const [perf, setPerf] = useState(null);
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
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
      {controls && <OrbitControls enableZoom={enableZoom} />}
      {perf && <Perf position={'bottom-right'} />}
    </>
  );
}