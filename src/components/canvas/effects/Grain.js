import { Effect } from 'postprocessing';
import { Uniform } from 'three';
import SRGB from './srgb';

// New grain this many times a second, from an integer frame count: a
// time-scaled seed loses precision and freezes into a fixed pattern.
const FPS = 24;

// Monochrome grain on device pixels: one factor on every channel so the hue
// holds, weighted by 4l(1 - l) on display luminance so blacks and highlights
// stay clean. time, if set, gives the seconds in place of the clock; frozen
// holds the current pattern still.
export default class Grain extends Effect {
  constructor(amount) {
    super(
      'Grain',
      `uniform float amount;
uniform float frame;
${SRGB}
float grainHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float s = 2.0 * amount * (grainHash(floor(uv * resolution) + frame * vec2(113.0, 71.0)) - 0.5);
  vec3 c = max(inputColor.rgb, 0.0);
  float a = inputColor.a;
  float l = a > 0.0 ? dot(min(encodeSRGB(c) / a, 1.0), vec3(0.2126, 0.7152, 0.0722)) : 0.0;
  vec3 d = encodeSRGB(c * (1.0 + s * 4.0 * l * (1.0 - l)));
  outputColor = vec4(decodeSRGB(min(d, vec3(alpha8(a)))), a);
}`,
      {
        uniforms: new Map([
          ['amount', new Uniform(amount)],
          ['frame', new Uniform(0)]
        ])
      }
    );
    this.clock = 0;
    this.time = null;
    this.frozen = false;
  }

  update(renderer, inputBuffer, deltaTime) {
    if (this.frozen) return;
    this.clock += deltaTime;
    const t = this.time ? this.time() : this.clock;
    this.uniforms.get('frame').value = Math.floor(t * FPS) % 4096;
  }
}
