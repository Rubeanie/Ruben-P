import { stegaClean } from '@sanity/client/stega';

// Markup that draws nothing: only scripts, styles, head tags and comments. A
// script that injects content later still grows the box, just without a gap.
const SILENT =
  /<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>|<(?:link|meta)\b(?:"[^"]*"|'[^']*'|[^'">])*>|<!--[\s\S]*?-->/gi;

export const isQuietHtml = (code) =>
  !stegaClean(code ?? '')
    .replace(SILENT, '')
    .replace(/[ \t\n\r\f]+/g, '');

const draws = (m) => m._type !== 'custom-html' || !isQuietHtml(m.html?.code);

// The module that opens the page; an embed that draws nothing doesn't.
export const firstModule = (modules) => modules?.find(draws);

// Every module that draws something, in page order.
export const drawnModules = (modules) => modules?.filter(draws) ?? [];

const MEDIA = new Set([
  'hero',
  'hero.saas',
  'hero.split',
  'hero.3d',
  'media-carousel'
]);
const hasMedia = (m) =>
  MEDIA.has(m._type) ||
  (m._type === 'richtext-module' &&
    m.content?.some(
      ({ _type }) => _type === 'imageBlock' || _type === 'youtube'
    ));

// The first module with an image or video, which is likely the page's largest
// paint: its opening media loads eagerly at high priority.
export const leadModule = (modules) => modules?.find(hasMedia);
