'use client'

import { useGLTF } from '@react-three/drei'
import { useState, useEffect } from 'react';
import { a, useSpring } from '@react-spring/three';

export const Logo = ({ ...props }) => {
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
    config: { duration: 20000, precision: 0.0001 },
    loop: true,
    from: { y: -0.065 },
    to: { y: Math.PI * 2 - 0.065 }
  });

  useEffect(() => {
    const updateScale = () => {
      setTimeout(() => {
        setScale(Math.min(1, window.screen.width / 600));
      }, 10);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      window.addEventListener('orientationchange', updateScale);
    };
  }, []);

  return (
    <group dispose={null} {...props}>
      <a.mesh
        geometry={nodes['RP_-_Logo001'].geometry}
        rotation-y={y}
        scale={scale}
        material={materials.Abstract}
        material-transparent
        material-opacity={transparency}
      />
    </group>
  );
}