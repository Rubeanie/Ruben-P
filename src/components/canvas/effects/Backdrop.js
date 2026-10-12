import { Effect } from 'postprocessing';
import { Color, Uniform } from 'three';
import SRGB from './srgb';

// An opaque colour behind the render, laid after tone mapping in display space
// the way the browser composites a transparent canvas over a CSS colour. A scene
// background would be tone mapped with the model and come out darker.
export default class Backdrop extends Effect {
  constructor(color) {
    super(
      'Backdrop',
      `uniform vec3 color;
${SRGB}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 d = encodeSRGB(max(inputColor.rgb, 0.0)) + (1.0 - inputColor.a) * color;
  outputColor = vec4(decodeSRGB(min(d, 1.0)), 1.0);
}`,
      {
        uniforms: new Map([
          ['color', new Uniform(new Color(color).convertLinearToSRGB())]
        ])
      }
    );
  }
}
