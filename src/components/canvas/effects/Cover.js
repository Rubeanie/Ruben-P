import { Effect } from 'postprocessing';
import SRGB from './srgb';

// The canvas is premultiplied, so light over the page needs coverage or the
// browser drops it: alpha becomes at least the brightest encoded channel and no
// channel exceeds it, so a faint halo composites close to added light and a
// strong one as a soft cover.
export default class Cover extends Effect {
  constructor() {
    super(
      'Cover',
      `${SRGB}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 d = clamp(encodeSRGB(max(inputColor.rgb, 0.0)), 0.0, 1.0);
  float a = clamp(max(inputColor.a, max(d.r, max(d.g, d.b))), 0.0, 1.0);
  outputColor = vec4(decodeSRGB(min(d, vec3(alpha8(a)))), a);
}`
    );
  }
}
