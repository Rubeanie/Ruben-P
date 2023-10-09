'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useState, useEffect } from 'react'
import { OrbitControls, PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
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
    <PerspectiveCamera makeDefault fov={60} near={1.9} far={3.9} position={[0, 0, 3]} />
  </Suspense>
)

const View = forwardRef(({ children, orbit, ...props }, ref) => {
  const localRef = useRef(null)
  useImperativeHandle(ref, () => localRef.current)
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
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>
          {children}
          {orbit && <OrbitControls />}
          {perf ? <Perf position={'bottom-right'} /> : null}
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
