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
const SceneEnvironment = dynamic(
  () => import('@/components/canvas/SceneEnvironment'),
  { ssr: false }
);

export default function SceneCanvas({
  model,
  background,
  lights,
  height,
  width,
  environmentSource,
  environmentPreset,
  environment,
  orbitControls,
  zoom
}) {
  // Inline styles win over the .canvas class, so height/width override the CSS
  // defaults only when the CMS sets them. Canvas defaults to pointerEvents:'none';
  // re-enable them when the scene has interactive orbit controls.
  const style = {
    pointerEvents: orbitControls ? 'auto' : 'none',
    ...(height && { height }),
    ...(width && { width })
  };

  return (
    <Canvas className={styles.canvas} style={style}>
      <Suspense fallback={null}>
        {model && <Model url={model} />}
        <SceneEnvironment
          source={environmentSource}
          preset={environmentPreset}
          url={environment}
        />
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
