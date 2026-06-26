'use client';

import { useProgress } from '@react-three/drei';
import { Loading } from '@/components/dom/Loading';

// DOM loading overlay shown while scene assets load. useProgress tracks three's
// default loading manager, so it covers both the GLB and the HDRI. It lives
// outside the WebGL tree (like drei's own <Loader>) because a DOM loader can't
// render inside the R3F canvas. Mounted in Canvas.jsx's wrapper.
export default function CanvasLoader() {
  const { active } = useProgress();

  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
      <Loading />
    </div>
  );
}
