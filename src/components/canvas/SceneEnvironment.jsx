'use client';

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

// Suspense cache: throw the import promise so a preset HDRI loads *inside* the
// canvas Suspense boundary (covered by the loader, gated alongside the model —
// no useEffect two-phase that would re-suspend and flicker the model).
const presetCache = new Map();
function readPreset(preset) {
  let entry = presetCache.get(preset);
  if (!entry) {
    entry = { status: 'pending' };
    entry.promise = presetLoaders[preset]().then(
      (mod) => {
        entry.status = 'done';
        entry.value = mod.default;
      },
      (err) => {
        entry.status = 'error';
        entry.error = err;
      }
    );
    presetCache.set(preset, entry);
  }
  if (entry.status === 'pending') throw entry.promise;
  if (entry.status === 'error') throw entry.error;
  return entry.value;
}

function PresetEnvironment({ preset, background }) {
  return <Environment files={readPreset(preset)} background={background} />;
}

// Image-based lighting. With `background` off it only sets scene.environment
// (no geometry, so <Bounds> model framing is unaffected); with it on, the HDRI
// also becomes the visible backdrop, overriding the background colour.
export default function SceneEnvironment({ source, preset, url, background }) {
  if (source === 'preset' && presetLoaders[preset]) {
    return <PresetEnvironment preset={preset} background={background} />;
  }
  if (url) {
    return <Environment files={url} background={background} />;
  }
  return null;
}
