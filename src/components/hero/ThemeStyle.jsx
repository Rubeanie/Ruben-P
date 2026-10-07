import { DEFAULT_THEME_COLORS } from '@/lib/themes';

const KEYS = ['primary', 'secondary', 'background', 'text'];
// The site's $ease-in-out token.
const EASE = 'cubic-bezier(0.45, 0, 0.55, 1)';

const decl = (value) =>
  KEYS.map((key) => `--color-${key}: ${value(key)};`).join(' ');
const page = (key) => `var(--page-${key}, ${DEFAULT_THEME_COLORS[key]})`;

// Server-rendered, so the first paint is already in the hero's theme.
// !important beats the ThemeProvider's inline page theme; removing the match
// lets the registered colours transition back to it. The scroll blend runs
// perceptually (oklch endpoints, so the browser never interpolates in sRGB)
// from the hero's colours to the page's over 0 to `end`.
export default function ThemeStyle({ colors, end }) {
  const hero = decl((key) => `${colors[key]} !important`);
  const fade = KEYS.map((key) => `--color-${key} 0.6s ${EASE}`).join(', ');

  const css = `
:root { --blend-end: ${end}; }
html[data-hero-settled] { transition: ${fade}; }
@keyframes hero-tone {
  from { ${decl((key) => `oklch(from ${colors[key]} l c h)`)} }
  to { ${decl((key) => `oklch(from ${page(key)} l c h)`)} }
}
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    html:has([data-hero-theme]) {
      animation: hero-tone linear both;
      animation-timeline: scroll(root);
      animation-range: 0 var(--blend-end);
    }
  }
}
@supports not (animation-timeline: scroll()) {
  html:has([data-hero-theme='on']) { ${hero} }
}
@media (prefers-reduced-motion: reduce) {
  html[data-hero-settled] { transition: none; }
  html:has([data-hero-theme='on']) { ${hero} }
}`;

  return <style>{css}</style>;
}
