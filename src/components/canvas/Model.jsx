'use client';

import { useGLTF, Center, Bounds, Clone } from '@react-three/drei';

// Generic GLB renderer for CMS-provided models: auto-frames an arbitrary model
// regardless of its scale/origin. Lighting comes from the model's own embedded
// lights and/or the CMS ambient colour (Common) — deliberately none here, so a
// lit GLB isn't double-lit. An unlit GLB with no CMS ambient renders dark.
export default function Model({ url }) {
  const { scene } = useGLTF(url);

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        {/* Clone, not <primitive>: useGLTF caches one scene per URL, and an
            Object3D has a single parent — sharing it would let a second
            instance steal the model from the first. */}
        <Clone object={scene} />
      </Center>
    </Bounds>
  );
}
