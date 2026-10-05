import { stegaClean } from '@sanity/client/stega';

// Markup that draws nothing: only scripts, styles, head tags and comments. A
// script that injects content later still grows the box, just without a gap.
const SILENT =
  /<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>|<(?:link|meta)\b(?:"[^"]*"|'[^']*'|[^'">])*>|<!--[\s\S]*?-->/gi;

export const isQuietHtml = (code) =>
  !stegaClean(code ?? '')
    .replace(SILENT, '')
    .replace(/[ \t\n\r\f]+/g, '');

// The module that opens the page; an embed that draws nothing doesn't.
export const firstModule = (modules) =>
  modules?.find((m) => m._type !== 'custom-html' || !isQuietHtml(m.html?.code));
