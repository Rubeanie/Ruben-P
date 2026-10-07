import { blockText } from './text';

const childAt = (value, segment) =>
  typeof segment === 'object'
    ? Array.isArray(value)
      ? value.find((item) => item?._key === segment._key)
      : undefined
    : value?.[segment];

const getAt = (doc, path) => path.reduce(childAt, doc);

// The patch path Sanity takes: modules[_key=="a"].content[_key=="b"].children[_key=="c"].text
export const pathString = (path) =>
  path
    .map((segment, i) =>
      typeof segment === 'object'
        ? `[_key==${JSON.stringify(segment._key)}]`
        : typeof segment === 'number'
          ? `[${segment}]`
          : `${i ? '.' : ''}${segment}`
    )
    .join('');

const splice = (text, at, length, replacement) =>
  text.slice(0, at) + replacement + text.slice(at + length);

// The one string to set for a fix, read against the document as it is now.
// `stale` when the field no longer reads the same at the recorded offset;
// null when the fix spans several pieces of formatting, so only copying it is safe.
export function planEdit(doc, { path, start, offset, original, replacement }) {
  const value = getAt(doc, path);
  const at = start + offset;
  const text =
    typeof value === 'string'
      ? value
      : value?._type === 'block'
        ? blockText(value)
        : null;
  if (text?.slice(at, at + original.length) !== original)
    return { stale: true };
  if (typeof value === 'string')
    return {
      path: pathString(path),
      value: splice(value, at, original.length, replacement)
    };

  let from = 0;
  for (const child of value.children ?? []) {
    const own = child.text ?? '';
    const end = from + own.length;
    if (at >= from && at + original.length <= end)
      return child._key
        ? {
            path: pathString([
              ...path,
              'children',
              { _key: child._key },
              'text'
            ]),
            value: splice(own, at - from, original.length, replacement)
          }
        : null;
    from = end;
  }
  return null;
}

// What a card can apply; null leaves it copy-only. An AI fix names its words
// but not where they are, so it is placed only when they appear once.
export function fixEdit(fix) {
  const first = fix.text?.indexOf(fix.original) ?? -1;
  if (!fix.path || first < 0 || fix.text.indexOf(fix.original, first + 1) >= 0)
    return null;
  return {
    path: fix.path,
    start: fix.start,
    offset: first,
    original: fix.original,
    replacement: fix.suggestion
  };
}

export const matchEdit = (match, replacement) =>
  match.path
    ? {
        path: match.path,
        start: match.start,
        offset: match.offset,
        original: match.text.slice(match.offset, match.offset + match.length),
        replacement
      }
    : null;
