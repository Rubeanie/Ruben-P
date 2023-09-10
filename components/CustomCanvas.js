'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { extend, createRoot } from '@react-three/fiber';
import { ColorManagement, Group, Mesh, PointLight } from 'three';
import { Html, PerformanceMonitor } from '@react-three/drei';
import useMeasure from 'react-use-measure';
import round from 'lodash/round';
import { RpLogo } from '../components/RpLogo';

extend({ ColorManagement, Group, Mesh, PointLight });

export const CustomCanvas = ({ children }) => {
  const [dpr, setDpr] = useState(0.9);
  const [containerRef, { width, height }] = useMeasure();
  const canvasRef = useRef(null);
  const [root, setRoot] = useState(null);

  useEffect(() => {
    if (canvasRef.current && !root) {
      const newRoot = createRoot(canvasRef.current);
      setRoot(newRoot);
    }
  }, [canvasRef, root]);

  useEffect(() => {
    if (root && width > 0 && height > 0) {
      root.configure({
        gl: {
          precision: 'lowp',
          powerPreference: 'high-performance'
        },
        size: { width: Math.min(width, height * 0.66), height: height },
        dpr: dpr,
        camera: { position: [0, 0, 3], fov: 60, near: 1.9, far: 3.9 }
      });

      root.render(
        <>
          <Suspense
            fallback={
              <Html center className='placeholder'>
                <div
                  className='column'
                  style={{
                    height: `calc(361.1867px/(841 / ${height}))`,
                    maxHeight: `calc(59.7347vw/(841 / ${height}))`,
                    width: `calc(520px/(841 / ${height}))`,
                    maxWidth: `calc(86vw/(841 / ${height}))`,
                    transition: 'opacity 0.5s',
                    position: 'relative'
                  }}>
                  <Image
                    src='https://res.cloudinary.com/ruben-p/image/upload/3D%20Models/Logo/Placeholder%20RP-Logo.webp'
                    alt='RP-Logo 3D model placeholder'
                    fill={true}
                    sizes='800px'
                    priority={true}
                  />
                </div>
              </Html>
            }>
            <RpLogo />
            {children}
            <PerformanceMonitor
              ms={200}
              iterations={7}
              step={0.05}
              factor={1}
              onChange={({ factor }) => setDpr(round(0.2 + 0.7 * factor, 2))}
            />
          </Suspense>
        </>
      );
    }
  }, [children, dpr, height, root, width]);

  useEffect(() => {
    return () => {
      if (root) {
        root.unmount();
      }
    };
  }, [root]);

  return (
    <div ref={containerRef} className='threeJS'>
      <canvas ref={canvasRef} />
    </div>
  );
};
