'use client'

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import round from 'lodash/round';
import { r3f } from '@/helpers/global'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function Scene({ ...props }) {
  const [dpr, setDpr] = useState(0.9)

  return (
    <Canvas
      gl={{
        precision: 'lowp',
        powerPreference: "high-performance"
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
        onChange={({ factor }) => setDpr(round(0.5 + 0.6 * factor, 2))}
      />
      <Suspense fallback={null}>
        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.06} luminanceSmoothing={0.65} height={410} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
