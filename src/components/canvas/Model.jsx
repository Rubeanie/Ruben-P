'use client';

import { useGLTF, Center, Bounds, Clone } from '@react-three/drei';

// Generic GLB renderer for CMS-provided models. Unlike Logo (which is the
// site logo with bespoke theme lights + spin), this auto-frames an arbitrary
// model regardless of its scale/origin and lights it neutrally so it isn't flat.
// Might be worth adding <Environment> if a model needs real PBR reflections.
export default function Model({ url }) {
  const { scene } = useGLTF(url);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={2.5} />
      <Bounds fit clip observe margin={1.2}>
        <Center>
          {/* Clone, not <primitive>: useGLTF caches one scene per URL, and an
              Object3D has a single parent — sharing it would let a second
              instance steal the model from the first. */}
          <Clone object={scene} />
        </Center>
      </Bounds>
    </>
  );
}
