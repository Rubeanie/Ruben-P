'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import {
  BlendFunction,
  BloomEffect,
  ToneMappingEffect,
  VignetteEffect
} from 'postprocessing';
import Cover from './Cover';
import Fxaa from './Fxaa';
import Glow from './Glow';
import Grain from './Grain';
import ditherOutput from './dither';

export const BLOOM = {
  quiet: { intensity: 0.35, threshold: 0.7, smoothing: 0.6 },
  medium: { intensity: 1, threshold: 0.7, smoothing: 0.6 }
};
export const GRAIN = 0.1;

// Half resolution holds a phone's bloom targets to about 20 MB; the chain starts
// a level lower, so one level fewer keeps the halo's reach.
const SCALE = 0.5;
const LEVELS = 5;
const RADIUS = 0.7;
// How far the threshold rises at bloom level 0, so a dim frame blooms only its
// hottest pixels.
const LIFT = 0.5;

// The renderer's lowp is fp16 on iOS: the grain's seed overflows it and uv
// lookups across a wide target lose sub-texel precision.
function highp(material) {
  if (!material || material.precision === 'highp') return;
  material.precision = 'highp';
  material.needsUpdate = true;
}

// mipmapBlur ignores Bloom's own resolutionScale, so the luminance pass and the
// mip chain are sized here.
class ScaledBloom extends BloomEffect {
  constructor(options) {
    super(options);
    highp(this.luminancePass.fullscreenMaterial);
    highp(this.mipmapBlurPass.downsamplingMaterial);
    highp(this.mipmapBlurPass.upsamplingMaterial);
  }

  setSize(width, height) {
    super.setSize(width, height);
    const w = Math.max(1, Math.round(width * SCALE));
    const h = Math.max(1, Math.round(height * SCALE));
    this.luminancePass.setSize(w, h);
    this.mipmapBlurPass.setSize(w, h);
  }
}

const read = (value) => (typeof value === 'function' ? value() : value);

// Outside the component: the compiler's lint rejects mutating the memoized chain
// from the frame callback.
function update(chain, bloom, vignette, grainTime, frozen, composer) {
  const level = read(bloom.level) ?? 1;
  chain.bloom.intensity = bloom.intensity * level;
  chain.bloom.luminanceMaterial.threshold =
    bloom.threshold + (1 - level) * LIFT;
  if (chain.vignette) chain.vignette.blendMode.opacity.value = read(vignette);
  if (chain.grain) {
    chain.grain.time = grainTime;
    chain.grain.frozen = frozen;
  }
  // The composer builds new passes whenever the chain changes.
  composer?.passes.forEach((pass) => highp(pass.fullscreenMaterial));
  const last = composer?.passes.at(-1);
  if (last?.fullscreenMaterial) ditherOutput(last.fullscreenMaterial);
}

const REDUCED = '(prefers-reduced-motion: reduce)';
const subscribe = (change) => {
  const query = matchMedia(REDUCED);
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
};
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, () => matchMedia(REDUCED).matches);

// Bloom as light before tone mapping, then an optional vignette and grain;
// bloom.level (0 to 1) and vignette may be functions, read every frame, and
// grainTime gives the grain its time in seconds in place of the clock.
export default function PostFx({
  bloom,
  toneMapping,
  transparent = false,
  vignette,
  grain = 0,
  grainTime
}) {
  const composer = useRef(null);
  const { smoothing } = bloom;
  const vignetted = vignette !== undefined;
  const chain = useMemo(() => {
    const halo = new ScaledBloom({
      blendFunction: BlendFunction.SKIP,
      mipmapBlur: true,
      levels: LEVELS,
      radius: RADIUS,
      luminanceSmoothing: smoothing
    });
    const shade = vignetted
      ? new VignetteEffect({ offset: 0.35, darkness: 0.6 })
      : null;
    const noise = grain > 0 ? new Grain(grain) : null;
    return {
      bloom: halo,
      vignette: shade,
      grain: noise,
      // FXAA first, as it reads its neighbours from the pass input. The vignette
      // before Cover and the grain after it: both keep every channel under alpha.
      effects: [
        transparent && new Fxaa(),
        halo,
        new Glow(halo, 'wall'),
        new ToneMappingEffect({ mode: toneMapping }),
        transparent && new Glow(halo, 'page'),
        shade,
        transparent && new Cover(),
        noise
      ].filter(Boolean)
    };
  }, [smoothing, toneMapping, transparent, vignetted, grain]);
  useEffect(
    () => () => chain.effects.forEach((effect) => effect.dispose()),
    [chain]
  );
  const reduced = useReducedMotion();
  // The wrapper only resizes on a CSS size change, not a new pixel ratio.
  const dpr = useThree((s) => s.viewport.dpr);
  useEffect(() => {
    composer.current?.setSize();
  }, [dpr]);

  useFrame(() =>
    update(chain, bloom, vignette, grainTime, reduced, composer.current)
  );

  return (
    <EffectComposer ref={composer} multisampling={0}>
      {chain.effects.map((effect, i) => (
        <primitive key={i} object={effect} />
      ))}
    </EffectComposer>
  );
}
