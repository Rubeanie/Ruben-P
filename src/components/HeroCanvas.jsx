'use client';

import styles from '@/styles/components/HeroCanvas.module.scss';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { canvas as Canvas } from '@/utils/canvas.js';
import { Html, useGLTF } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useColor } from '@/utils/themes.js';
import useMeasure from 'react-use-measure';

export default function Viewport() {
  const [containerRef, { width, height }] = useMeasure();

  return (
    <Canvas
      ref={containerRef}
      size={{ width: Math.min(width, height * 0.66), height: height }}
      camera={{ fov: 60, near: 1.9, far: 3.9, position: [0, 0, 3] }}
      fallback={<Placeholder height={height} />}
      styles={styles.heroCanvas}
    >
      <Model />
    </Canvas>
  );
}

function Placeholder({ height = 0 }) {
  return (
    <Html center style={{ margin: "auto" }}>
      <div
        style={{
          position: 'relative',
          height: `calc(361.1867px/(841 / ${height}))`,
          maxHeight: `calc(59.7347vw/(841 / ${height}))`,
          width: `calc(520px/(841 / ${height}))`,
          maxWidth: `calc(86vw/(841 / ${height}))`
          /* transition: 'opacity 0.5s',
          position: 'relative',
          opacity: opacity */
        }}>
        <Image
          src='/models/rp-logo/placeholder.webp'
          alt='RP-Logo 3D model placeholder'
          fill={true}
          sizes='800px'
          priority={true}
        />
      </div>
    </Html>
  );
}

function Model() {
  const [scale, setScale] = useState(Math.min(1, window.screen.width / 600));
  const { nodes, materials } = useGLTF(
    '/models/rp-logo/model.glb'
  );

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
    <group dispose={null}>
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