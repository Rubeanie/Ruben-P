import { FXAAEffect } from 'postprocessing';

// FXAA with alpha in its luma, so a dark face's silhouette over the transparent
// area reads as an edge.
export default class Fxaa extends FXAAEffect {
  constructor() {
    super();
    this.setFragmentShader(
      `float aaLuma(const in vec4 c) { return luminance(c.rgb) + 0.1 * c.a; }\n${this.getFragmentShader()
        .replace(/luminance\(inputColor\.rgb\)/g, 'aaLuma(inputColor)')
        .replace(
          /luminance\(texture2D\(inputBuffer,(\w+)\)\.rgb\)/g,
          'aaLuma(texture2D(inputBuffer,$1))'
        )}`
    );
  }
}
