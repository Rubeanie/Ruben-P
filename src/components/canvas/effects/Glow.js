import { Effect } from 'postprocessing';
import { Uniform } from 'three';
import SRGB from './srgb';

// A bloom's halo as light, in two layers around tone mapping. wall adds it to the
// frame's straight colour in linear HDR, so the tone mapper rolls it off in hue
// like any other highlight and maps an edge pixel's colour, not colour times
// coverage. page premultiplies after the encode, as the canvas's own resolve
// would, and lays the halo over the uncovered part as 1 - exp(-5 halo) in
// display space: through the sRGB curve its faint tail would lift into a
// plateau with an edge. 5 is about the sRGB slope at dark levels. Without page
// the frame must be opaque, where straight and premultiplied agree.
const LAYERS = {
  wall: 'outputColor = vec4(inputColor.a > 0.0 ? inputColor.rgb / inputColor.a + h : vec3(0.0), inputColor.a);',
  page: `mediump vec3 g = 1.0 - exp(-5.0 * h);
  float a = inputColor.a;
  mediump vec3 s = a > 0.0 ? encodeSRGB(max(inputColor.rgb, 0.0)) * a : vec3(0.0);
  outputColor = vec4(decodeSRGB(s + (1.0 - a) * g), a);`
};

export default class Glow extends Effect {
  constructor(bloom, layer) {
    super(
      'Glow',
      `uniform sampler2D glow;
uniform float gain;
${SRGB}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  mediump vec3 h = texture2D(glow, uv).rgb * gain;
  ${LAYERS[layer]}
}`,
      {
        uniforms: new Map([
          ['glow', new Uniform(null)],
          ['gain', new Uniform(0)]
        ])
      }
    );
    this.bloom = bloom;
  }

  update() {
    this.uniforms.get('glow').value = this.bloom.texture;
    this.uniforms.get('gain').value = this.bloom.intensity;
  }
}
