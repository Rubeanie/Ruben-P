import { stegaClean } from '@sanity/client/stega';
import CTA from '@/components/CTA';

// Values are keyed by `source` and supplied by the page at request time; the
// object itself never stores an href.
export default function DynamicValue({ value, values }) {
  const v = values?.[stegaClean(value.source)];
  if (!v) return value.fallback ?? null;

  const text = v.label ?? v.href;
  const presentation = stegaClean(value.presentation);
  if (presentation === 'button' && v.href)
    return <CTA link={{ type: 'external', external: v.href, label: text }} />;
  if (presentation === 'link' && v.href) return <a href={v.href}>{text}</a>;
  return text;
}
