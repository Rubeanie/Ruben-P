// Dithers a pass's output after the sRGB encode, one value on all three channels
// and never above alpha. three's material dithering lands before the encode
// behind a composer, where it reads as coloured speckle in the darks.
const DITHER =
  'highp float noise = (rand(gl_FragCoord.xy) - 0.5) / 255.0; gl_FragColor.rgb = clamp(gl_FragColor.rgb + noise, 0.0, gl_FragColor.a);';

export default function ditherOutput(material) {
  if (material.userData.dithered) return;
  material.userData.dithered = true;
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      DITHER
    );
  };
  material.customProgramCacheKey = () => 'dither-output';
  material.needsUpdate = true;
}
