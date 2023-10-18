'use client'

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import round from 'lodash/round';
import { r3f } from '@/helpers/global'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function Scene({ ...props }) {
  const [dpr, setDpr] = useState(1)

  return (
    <Canvas
      gl={{
        powerPreference: "high-performance",
        stencil: false,
        depth: false
      }}
      dpr={dpr}
      {...props}>
      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
      <PerformanceMonitor
        ms={200}
        iterations={7}
        step={0.05}
        factor={1}
        onChange={({ factor }) => setDpr(round(0.5 + 0.75 * factor, 2))}
      />
      <Suspense fallback={null}>
        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.06} luminanceSmoothing={0.65} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
