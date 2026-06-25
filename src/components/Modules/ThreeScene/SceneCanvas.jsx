'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loading } from '@/components/dom/Loading';
import styles from '@/styles/components/ThreeScene.module.scss';

const Canvas = dynamic(() => import('@/components/canvas/Canvas'), {
  ssr: false,
  loading: () => (
    <div className={styles.canvas}>
      <Loading />
    </div>
  )
});
const Model = dynamic(() => import('@/components/canvas/Model'), { ssr: false });
const Common = dynamic(() => import('@/components/canvas/Common'), {
  ssr: false
});

export default function SceneCanvas({
  model,
  background,
  lights,
  orbitControls,
  zoom
}) {
  return (
    // Canvas defaults to pointerEvents:'none'; re-enable them when the scene
    // has interactive orbit controls.
    <Canvas
      className={styles.canvas}
      style={{ pointerEvents: orbitControls ? 'auto' : 'none' }}>
      <Suspense fallback={null}>
        {model && <Model url={model} />}
        <Common
          color={background}
          lights={lights}
          controls={orbitControls}
          enableZoom={zoom}
        />
      </Suspense>
    </Canvas>
  );
}
