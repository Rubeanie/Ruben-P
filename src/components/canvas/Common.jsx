'use client';

import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

export default function Common({
  color,
  lights,
  controls,
  enableZoom = false
}) {
  return (
    <>
      {color && <color attach='background' args={[color]} />}
      {lights && <ambientLight color={lights} intensity={1} />}
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 3]} />
      {controls && <OrbitControls makeDefault enableZoom={enableZoom} />}
    </>
  );
}
