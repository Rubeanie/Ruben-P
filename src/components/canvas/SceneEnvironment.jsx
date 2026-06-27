'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';
import { useTheme } from '@/components/ThemeContext';
import { loadThemeImage } from '@/lib/themes';

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

// Decode off-thread via createImageBitmap; fall back to <img> if it fails. Both
// work with drawImage; only ImageBitmap has close().
async function decodeImage(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    return await createImageBitmap(await res.blob());
  } catch {
    return loadThemeImage(url);
  }
}

// Mean luminance of the image, sampled from a tiny downscale (cheap, avoids
// reading megapixels back from the GPU). 0 = black, 1 = white.
function meanLuminance(img) {
  const s = document.createElement('canvas');
  s.width = 16;
  s.height = 16;
  const ctx = s.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, 16, 16);
  const { data } = ctx.getImageData(0, 0, 16, 16);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  }
  return sum / (data.length / 4);
}

// The live theme image baked into a seamless equirectangular sphere map: the
// right half is mirror-flipped so the 360° wrap has no hard seam. Not an
// accurate HDRI — "close enough" reflections/backdrop that track the theme.
function ThemeEnvironment({ background }) {
  const { theme } = useTheme();
  const url = theme?.url;
  const [env, setEnv] = useState(null);

  useEffect(() => {
    if (!url) {
      setEnv(null);
      return undefined;
    }
    let cancelled = false;
    let created = null;

    decodeImage(url)
      .then((img) => {
        try {
          if (cancelled) return;
          const canvas = document.createElement('canvas');
          canvas.width = img.width * 2;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height);
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const tex = new THREE.CanvasTexture(canvas);
          tex.mapping = THREE.EquirectangularReflectionMapping;
          tex.colorSpace = THREE.SRGBColorSpace;
          created = tex;

          // Normalise env brightness across themes (dark lift, bright come
          // down); the optional key light supplies the form a flat map can't.
          const TARGET = 0.4;
          const lum = Math.max(meanLuminance(img), 0.001);
          const intensity = Math.min(4, Math.max(0.5, TARGET / lum));

          setEnv({ texture: tex, intensity });
        } finally {
          img.close?.();
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (created) created.dispose();
    };
  }, [url]);

  if (!env) return null;
  return (
    <Environment
      map={env.texture}
      environmentIntensity={env.intensity}
      background={background}
    />
  );
}

// Image-based lighting. With `background` off it only sets scene.environment
// (no geometry, so <Bounds> model framing is unaffected); with it on, the HDRI
// also becomes the visible backdrop, overriding the background colour.
export default function SceneEnvironment({ source, preset, url, background }) {
  if (source === 'preset' && presetLoaders[preset]) {
    return <PresetEnvironment preset={preset} background={background} />;
  }
  if (source === 'theme') {
    return <ThemeEnvironment background={background} />;
  }
  if (url) {
    return <Environment files={url} background={background} />;
  }
  return null;
}
