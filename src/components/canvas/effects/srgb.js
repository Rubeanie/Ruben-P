// The sRGB transfer both ways, and alpha floored to 8 bits: a channel clamped to
// it cannot end above the stored alpha, which the canvas truncates.
const SRGB = `vec3 encodeSRGB(const in vec3 c) {
  return mix(1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308))));
}
vec3 decodeSRGB(const in vec3 c) {
  return mix(pow((c + 0.055) / 1.055, vec3(2.4)), c / 12.92, vec3(lessThanEqual(c, vec3(0.04045))));
}
float alpha8(const in float a) {
  return floor(a * 255.0) / 255.0;
}`;

export default SRGB;
