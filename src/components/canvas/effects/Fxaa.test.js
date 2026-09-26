import { expect, test } from 'bun:test';
import Fxaa from './Fxaa';

test('Fxaa leaves no colour-only luma call in the shader', () => {
  const shader = new Fxaa().getFragmentShader();
  expect(shader).toContain('aaLuma(inputColor)');
  expect(shader).not.toMatch(
    /luminance\((inputColor|texture2D\([^)]*\))\.rgb\)/
  );
});
