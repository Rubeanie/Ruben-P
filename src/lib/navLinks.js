import { resolveLink } from '@/lib/processUrl';

const toLink = (item) =>
  item && {
    key: item._key ?? 'logo',
    label: item.label,
    href: resolveLink(item)
  };

// The bar shows the lead link on the logo; the dropdown lists it by label first.
// The optional call to action renders as a button after the links.
export function navLinks(menu) {
  const cta = toLink(menu?.cta);
  return {
    lead: toLink(menu?.leadLink),
    links: [
      ...(menu?.items ?? []).map(toLink),
      cta && { ...cta, key: 'cta', cta: true }
    ].filter((link) => link?.href)
  };
}
