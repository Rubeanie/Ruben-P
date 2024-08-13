'use client';

import { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useCSSVariable } from '@/utils/themes.js';

export default function Logo({ ...props }) {
  const [scale, setScale] = useState(Math.min(1, window.screen.width / 600));
  const { nodes, materials } = useGLTF('/models/rp-logo.glb');

  const { transparency } = useSpring({
    config: { mass: 15, tension: 290, friction: 60, clamp: true },
    to: {
      transparency: 1
    },
    from: { transparency: 0 }
  });

  const { y } = useSpring({
    config: { duration: 20000 },
    loop: true,
    from: { y: -0.065 },
    to: { y: Math.PI * 2 - 0.065 }
  });

  const size = useThree((state) => state.size);

  return (
    <>
      <group {...props} dispose={null}>
        <a.mesh
          geometry={nodes['RP_-_Logo001'].geometry}
          rotation-y={y}
          scale={Math.min(1, size.width / 530)}
          material={materials.Abstract}
          material-transparent
          material-opacity={transparency}
        />
      </group>
      <ambientLight intensity={0.1} />
      {[
        {
          position: [-6, 1, 7],
          color: useCSSVariable('--color-secondary'),
          intensity: 110,
          distance: 70,
          decay: 2
        },
        {
          position: [0, 1, 8],
          color: useCSSVariable('--color-primary'),
          intensity: 85,
          distance: 80,
          decay: 2
        },
        {
          position: [6, 1, 7],
          color: useCSSVariable('--color-secondary'),
          intensity: 110,
          distance: 70,
          decay: 2
        }
      ].map((lightProps, index) => (
        <pointLight key={index} {...lightProps} />
      ))}
    </>
  );
}

useGLTF.preload('/models/rp-logo.glb');
