import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Head from 'next/head';
import { RpLogo } from '../components/RpLogo';
import { GetColor } from '../lib/themes';
import Image from 'next/image';
import { Html, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import { Age /* , Stats */ } from '../lib/common';
import round from 'lodash/round';

export default function Home() {
  const [dpr, setDpr] = useState(0.8);
  const [height, setHeight] = useState(0);
  const updateDimensions = () => {
    setHeight(window.innerHeight);
  };
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  return (
    <div className='page'>
      <Head>
        <title>Home | Ruben Panzich</title>
        <meta
          name='description'
          content="I'm Ruben Panzich, I am a Freelance creative developer, with qualifications in game design and development."
        />
      </Head>
      <div className='row layer canvas'>
        <Canvas
          gl={{
            precision: 'lowp',
            powerPreference: 'high-performance'
          }}
          camera={{ position: [0, 0, 3], fov: 60, near: 1.9, far: 3.9 }}
          dpr={dpr}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}>
          {[
            {
              position: [-8, 1, 6],
              color: GetColor('--color-secondary'),
              intensity: 110,
              distance: 70
            },
            {
              position: [0, 1, 8],
              color: GetColor('--color-primary'),
              intensity: 85,
              distance: 80
            },
            {
              position: [8, 1, 6],
              color: GetColor('--color-secondary'),
              intensity: 110,
              distance: 70
            }
          ].map((lightProps, index) => (
            <pointLight key={index} {...lightProps} />
          ))}
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
            <PerformanceMonitor
              ms={200}
              iterations={7}
              step={0.05}
              factor={1}
              onChange={({ factor }) => setDpr(round(0.2 + 0.7 * factor, 2))}
            />
            <AdaptiveEvents />
          </Suspense>
        </Canvas>
      </div>
      <div
        className='hero-no-padding'
        style={{ width: '100%', height: '100%', zIndex: 1 }}>
        <div className='column'>
          <div className='layer'>
            <div className='column'>
              <h1 className='img-title'>
                Ruben
                <br />
                Panzich
              </h1>
              <p>
                <Age />
                -year-old student
                <br />
                freelance creative artist/developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
