// Rounds off float noise (1.5 * 1.12 * 100 is 168.00000000000003) before ceil.
const up = (value) => Math.ceil(Math.round(value * 1000) / 1000);

// `sizes` for a cover-fit photo in a box `heightVh` tall and `widthVw` wide:
// on screens narrower than the photo's ratio it fills by height, not width.
// zoom is any scale the photo animates from, so the rendition stays sharp.
export function coverSizes(ratio, heightVh, widthVw = 100, zoom = 1) {
  const width = `${up(widthVw * zoom)}vw`;
  if (!ratio) return width;
  const breakpoint = Math.round((ratio * heightVh * 100) / widthVw);
  return `(max-aspect-ratio: ${breakpoint}/100) ${up(heightVh * ratio * zoom)}vh, ${width}`;
}
