'use client';

import { useEffect, useState } from 'react';
import { Environment } from '@react-three/drei';

// Built-in presets ship as JS modules exporting a base64 data-URI (drei's
// getExtension reads data:application/exr). Explicit per-preset imports so each
// is its own lazy chunk — only the selected one downloads. (A template-literal
// import would mismatch: the files are .exr.js, not .exr.)
const presetLoaders = {
  apartment: () => import('@pmndrs/assets/hdri/apartment.exr'),
  bridge: () => import('@pmndrs/assets/hdri/bridge.exr'),
  city: () => import('@pmndrs/assets/hdri/city.exr'),
  dawn: () => import('@pmndrs/assets/hdri/dawn.exr'),
  esplanade: () => import('@pmndrs/assets/hdri/esplanade.exr'),
  forest: () => import('@pmndrs/assets/hdri/forest.exr'),
  hall: () => import('@pmndrs/assets/hdri/hall.exr'),
  lab: () => import('@pmndrs/assets/hdri/lab.exr'),
  lobby: () => import('@pmndrs/assets/hdri/lobby.exr'),
  night: () => import('@pmndrs/assets/hdri/night.exr'),
  park: () => import('@pmndrs/assets/hdri/park.exr'),
  sky: () => import('@pmndrs/assets/hdri/sky.exr'),
  studio: () => import('@pmndrs/assets/hdri/studio.exr'),
  sunrise: () => import('@pmndrs/assets/hdri/sunrise.exr'),
  sunset: () => import('@pmndrs/assets/hdri/sunset.exr'),
  venice: () => import('@pmndrs/assets/hdri/venice.exr'),
  warehouse: () => import('@pmndrs/assets/hdri/warehouse.exr'),
  workshop: () => import('@pmndrs/assets/hdri/workshop.exr')
};

// Image-based lighting only — no `background` prop, so it sets scene.environment
// without adding geometry (keeps <Bounds> model framing intact).
export default function SceneEnvironment({ source, preset, url }) {
  const [presetFile, setPresetFile] = useState(null);

  useEffect(() => {
    setPresetFile(null); // clear stale HDRI on any source/preset change
    if (source !== 'preset') return;
    const load = presetLoaders[preset];
    if (!load) return;
    let active = true;
    load().then((mod) => {
      if (active) setPresetFile(mod.default);
    });
    return () => {
      active = false;
    };
  }, [source, preset]);

  if (source === 'preset') {
    return presetFile ? <Environment files={presetFile} /> : null;
  }
  if (url) {
    return <Environment files={url} />;
  }
  return null;
}
