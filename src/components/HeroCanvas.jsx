'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loading } from '@/components/dom/Loading';
import styles from '@/styles/components/Canvas.module.scss';

const Common = dynamic(() => import('@/components/canvas/Common'), {
  ssr: false
});
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false });
const Canvas = dynamic(() => import('@/components/canvas/Canvas'), {
  ssr: false,
  loading: () => (
    <div className={styles.heroCanvas}>
      <Loading />
    </div>
  )
});

export default function HeroCanvas() {
  return (
    <Canvas className={styles.heroCanvas}>
      <Suspense fallback={<Loading message='Preparing logo...' />}>
        <Logo />
      </Suspense>
      <Suspense fallback={<Loading message='Preparing common elements...' />}>
        <Common />
      </Suspense>
    </Canvas>
  );
}
