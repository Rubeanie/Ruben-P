import { FIXED_IDS, anchors, moduleIds } from '@/lib/anchors';

export const singleton = (S, id, title) =>
  S.listItem()
    .id(id)
    .title(
      title ||
        id
          .split(/(?=[A-Z])/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
    )
    .child(S.editor().id(id).schemaType(id).documentId(id));

export const group = (S, title, items) =>
  S.listItem().title(title).child(S.list().title(title).items(items));

/**
 * Return the text of a block type as a single string. Use in schema previews.
 */
export function getBlockText(block, lineBreakChar = '↵ ') {
  return (
    block?.reduce((a, c, i) => {
      const text = c.children?.flatMap((c) => c.text).join('') || '';
      return a + text + (i !== block.length - 1 ? lineBreakChar : '');
    }, '') || ''
  );
}

export function count(arr, singular = 'item', plural) {
  return `${arr?.length || 0} ${arr?.length === 1 ? singular : plural || singular + 's'}`;
}

// A page's anchors: its headings for the picker, every id a link can target
// for the validator. Drafts for picking, published for what is live.
export async function targetAnchors(client, ref, perspective) {
  const page = await client.fetch(
    '*[_id == $id][0]{ title, modules }',
    { id: ref },
    { perspective }
  );
  if (!page) return null;
  const { headings } = anchors(page.modules);
  return {
    title: page.title,
    headings,
    ids: new Set([
      ...FIXED_IDS,
      ...moduleIds(page.modules),
      ...headings.map((h) => h.id)
    ])
  };
}

// Params hold an optional query and an optional fragment: ?a=b#section.
export const splitParams = (params) => {
  const text = params ?? '';
  const hash = text.indexOf('#');
  return hash < 0
    ? { query: text, fragment: '' }
    : { query: text.slice(0, hash), fragment: text.slice(hash + 1) };
};
