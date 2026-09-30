import { stegaClean } from '@sanity/client/stega';
import uid from './uid';

export const slugify = (text) =>
  stegaClean(text ?? '')
    .normalize('NFKD')
    // Accents only: other scripts keep their marks.
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section';

// Ids the page renders outside the modules: #top is Next's link to the top
// of the page, the rest are the navbar menu and the 3D loader's SVG defs.
export const FIXED_IDS = ['top', 'nav-menu', 'clip-path', 'highlightGradient'];

// Every id a module renders: its own, and the end marker heroes place after it.
export const moduleIds = (modules) =>
  (modules ?? []).flatMap((module) => [uid(module), `${uid(module)}-end`]);

// The second "Overview" becomes overview-2; an id already taken is skipped.
function slugger(taken) {
  const used = new Set(taken);
  return (text) => {
    const base = slugify(text);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };
}

const HEADING = /^(h[1-3]|h1Large)$/;

const textOf = (block) =>
  (block.children ?? []).map((child) => child.text ?? '').join('');

// Gives every heading on the page an id from its text, in document order.
// Fixed and module ids are reserved first, so a heading that repeats one
// takes a suffix instead. Each entry is tagged with where it sits: prose,
// a Creative column or an accordion.
export function anchors(modules) {
  const next = slugger([...FIXED_IDS, ...moduleIds(modules)]);
  const headings = [];

  const marked = modules?.map((module) => {
    const moduleId = uid(module);
    const mark = (node, text, level, kind) => {
      const id = next(text);
      headings.push({ id, text: stegaClean(text), level, kind, moduleId });
      return { ...node, anchor: id };
    };
    const blocks = (list, kind) =>
      list?.map((block) =>
        block._type === 'block' && HEADING.test(block.style)
          ? mark(block, textOf(block), Number(block.style[1]), kind)
          : block
      );

    switch (module._type) {
      case 'richtext-module':
      case 'callout':
        return { ...module, content: blocks(module.content, 'prose') };
      case 'creative-module':
        return {
          ...module,
          columns: module.columns?.map((column) => ({
            ...column,
            blocks: column.blocks?.map((block) =>
              block._type === 'heading' && block.text
                ? mark(block, block.text, 3, 'creative')
                : block
            )
          }))
        };
      case 'accordion-list':
        return {
          ...module,
          items: module.items?.map((item) => ({
            ...(item.summary ? mark(item, item.summary, 3, 'accordion') : item),
            content: blocks(item.content, 'accordion')
          }))
        };
      default:
        return module;
    }
  });
  return { modules: marked, headings };
}
