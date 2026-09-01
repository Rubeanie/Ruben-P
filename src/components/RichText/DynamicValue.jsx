import { stegaClean } from '@sanity/client/stega';

// Values are keyed by `source` and supplied by the page at request time; the
// object itself never stores an href.
export default function DynamicValue({ value, values }) {
  const v = values?.[stegaClean(value.source)];
  if (!v) return value.fallback ?? null;

  const text = v.label ?? v.href;
  const presentation = stegaClean(value.presentation);
  if (presentation === 'link' && v.href) return <a href={v.href}>{text}</a>;
  return text;
}
