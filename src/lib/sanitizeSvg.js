import DOMPurify from 'isomorphic-dompurify';

// Logos come from Sanity as raw SVG strings. Strip anything executable before
// they reach dangerouslySetInnerHTML.
export function sanitizeSvg(svg) {
  if (!svg) return svg;
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true }
  });
}
