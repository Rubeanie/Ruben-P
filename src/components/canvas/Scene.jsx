'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import round from 'lodash/round';
import { r3f } from '@/helpers/global'

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
    </Canvas>
  )
}
