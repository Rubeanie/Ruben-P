'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/dom/Loading';
import styles from '@/styles/components/ThreeScene.module.scss';

// Single dynamic boundary for the whole 3D scene, so R3F/three stay out of the
// page bundle. The inner Scene statically composes Canvas + Model + Environment
// so they suspend into Canvas's own Suspense — the loader then stays up through
// the real asset load, not just the JS-chunk load. (Importing Model/Common
// individually with next/dynamic would let each resolve to null during its own
// chunk load, hiding the loader before the GLB/HDRI actually arrive.)
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false,
  loading: () => (
    <div className={styles.canvas}>
      <Loading />
    </div>
  )
});

export default function SceneCanvas(props) {
  return <Scene {...props} />;
}
