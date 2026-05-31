'use client';

import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useTheme } from '@/components/ThemeContext';

export default function Logo({ ...props }) {
  const { nodes, materials } = useGLTF('/models/rp-logo.glb');
  const { colors } = useTheme();

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
          color: colors.secondary,
          intensity: 110,
          distance: 70,
          decay: 2
        },
        {
          position: [0, 1, 8],
          color: colors.primary,
          intensity: 85,
          distance: 80,
          decay: 2
        },
        {
          position: [6, 1, 7],
          color: colors.secondary,
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
