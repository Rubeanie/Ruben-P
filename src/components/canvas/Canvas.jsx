'use client'

import { forwardRef, Suspense, useRef, useState, useEffect } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { useColor } from '@/utils/themes.js';
import { Perf } from 'r3f-perf';

export const Common = ({ color }) => (
  <Suspense fallback={null}>
    {color && <color attach='background' args={[color]} />}
    <ambientLight intensity={0.1} />
    {[
      {
        position: [-6, 1, 7],
        color: useColor('--color-secondary'),
        intensity: 110,
        distance: 70
      },
      {
        position: [0, 1, 8],
        color: useColor('--color-primary'),
        intensity: 85,
        distance: 80
      },
      {
        position: [6, 1, 7],
        color: useColor('--color-secondary'),
        intensity: 110,
        distance: 70
      }
    ].map((lightProps, index) => (
      <pointLight key={index} {...lightProps} />
    ))}
    <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
  </Suspense>
)

/* Not using view in React Three Drei, as it has tracking issues on mobile */

const Canvas = ({ orbit, children }) => {
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
      <Three>
        {children}
        {orbit && <OrbitControls />}
        {perf ? <Perf position={'bottom-right'} /> : null}
      </Three>
    </>
  )
}
Canvas.displayName = 'Canvas'

export { Canvas }
