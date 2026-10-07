import Color from 'color';

// Limits come from each platform's docs where they publish them; the rest are
// approximate and say so in the limit lines.
export const PLATFORMS = [
  { id: 'google', name: 'Google' },
  { id: 'x', name: 'X' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'discord', name: 'Discord' },
  { id: 'slack', name: 'Slack' },
  { id: 'imessage', name: 'iMessage' }
];

export const DISCORD_TITLE_BYTES = 70;
export const DISCORD_DESCRIPTION_BYTES = 350;

const LINK_CARDS = ['summary', 'summary_large_image'];
const VALID_CARDS = [...LINK_CARDS, 'app', 'player'];

// Over these the platform drops the image and shows the card without one.
const IMAGE_CAPS = { x: 5e6, linkedin: 5e6, facebook: 8e6 };

const encoder = new TextEncoder();
const bytes = (text) => encoder.encode(text ?? '').length;
const kb = (n) => `${Math.round(n / 1e3)} KB`;

// Trims to a byte budget without splitting a character, as Discord counts bytes.
export function clipBytes(text, budget) {
  if (!text || bytes(text) <= budget) return text;
  let out = '';
  for (const ch of text) {
    if (bytes(out + ch + '…') > budget) break;
    out += ch;
  }
  return out + '…';
}

export const clipChars = (text, chars) =>
  text && text.length > chars ? text.slice(0, chars - 1).trimEnd() + '…' : text;

export const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
};

export const pathOf = (url) => {
  try {
    return new URL(url).pathname;
  } catch {
    return '/';
  }
};

// Which layout each platform picks for this page's tags and image.
export function layoutFor(id, tags, image) {
  const { width, height, size } = image;
  const known = width && height;
  if (id === 'x' && !LINK_CARDS.includes(tags.twitterCard))
    return VALID_CARDS.includes(tags.twitterCard) ? 'other' : 'invalid';
  if (!tags.ogImage) return id === 'imessage' ? 'icon' : 'none';
  if (size && size > IMAGE_CAPS[id]) return 'none';
  switch (id) {
    case 'x':
      if (tags.twitterCard === 'summary') return 'small';
      return known && (width < 300 || height < 157) ? 'small' : 'large';
    case 'facebook':
      return known && (width < 600 || height < 315) ? 'small' : 'large';
    case 'linkedin':
      return 'small';
    case 'whatsapp':
      return (known && width < 300) ||
        (size && size > 6e5) ||
        (known && width / height > 4)
        ? 'small'
        : 'large';
    case 'discord':
    case 'slack':
      return tags.twitterCard === 'summary_large_image' ? 'large' : 'small';
    case 'imessage':
      // Messages drops images under 150px wide, and the page plus its resources must fit 10 MB.
      return (width && width < 150) || (size && size > 1e7) ? 'icon' : 'large';
    default:
      return 'none';
  }
}

// Every reason a platform's card is worse than it could be, most serious first.
export function statusOf(id, { tags, sources, images }) {
  const { size, width, height } = images;
  const out = [];
  const siteOgOverride =
    sources.ogTitle.kind === 'site' && sources.title.kind === 'page';
  const invalidCard =
    tags.twitterCard && !VALID_CARDS.includes(tags.twitterCard);
  const layout = layoutFor(id, tags, images);
  if (id !== 'google' && !tags.ogImage) out.push('No image: text only');
  switch (id) {
    case 'google':
      if (tags.robots.startsWith('noindex'))
        out.push('Hidden: page is noindex');
      if ((tags.title?.length ?? 0) > 60) out.push('Title cut near 60 chars');
      if (!tags.description) out.push('No description: Google writes one');
      else if (tags.description.length > 160)
        out.push('Description cut near 160 chars');
      break;
    case 'x':
      if (invalidCard) out.push('Card type invalid: link only');
      if (layout === 'other')
        out.push(`Card type ${tags.twitterCard}: not a link card`);
      if (size > 5e6) out.push('Image over 5 MB: dropped');
      if ((tags.twitterTitle?.length ?? 0) > 70)
        out.push('Title cut at 70 chars');
      break;
    case 'facebook':
      if (size > 8e6) out.push('Image over 8 MB: dropped');
      if (layout === 'small') out.push('Image under 600×315: small thumbnail');
      break;
    case 'linkedin':
      if (size > 5e6) out.push('Image over 5 MB: dropped');
      break;
    case 'whatsapp':
      if (size > 6e5)
        out.push(`Image over 600 KB (${kb(size)}): small thumbnail`);
      else if (layout === 'small')
        out.push('Image too narrow: small thumbnail');
      break;
    case 'discord':
      if (invalidCard) out.push('Card type invalid: small image');
      // Discord paints its embed on a near-black panel; a near-black bar disappears into it.
      if (tags.themeColor && Color(tags.themeColor).luminosity() < 0.03)
        out.push('Bar nearly invisible');
      if (bytes(tags.ogTitle) > DISCORD_TITLE_BYTES)
        out.push('Title cut at 70 bytes');
      break;
    case 'slack':
      if (invalidCard) out.push('Card type invalid: small image');
      break;
    case 'imessage':
      if (size > 1e7) out.push('Image over 10 MB: icon card');
      else if (width && width < 900)
        out.push('Image under 900 px wide: may look soft');
      break;
  }
  if (
    !['google', 'imessage'].includes(id) &&
    width &&
    width < 1200 &&
    layout === 'large'
  )
    out.push(`Image ${width}×${height}: soft at full width`);
  if (id !== 'google' && siteOgOverride)
    out.push('Title from Site settings OG title');
  return out;
}

// One line per platform naming the layout it will pick and the limits in play.
export function limitLine(id, { tags, images }) {
  const layout = layoutFor(id, tags, images);
  const dims = images.width
    ? `${images.width}×${images.height}`
    : 'unknown size';
  const dropped = layout === 'none' && tags.ogImage;
  switch (id) {
    case 'google':
      return `Title cut near 600px (about 60 characters, now ${tags.title?.length ?? 0}). Snippet about 2 lines / 160 characters (now ${tags.description?.length ?? 0}). Approximate: Google may rewrite both.`;
    case 'x':
      if (layout === 'invalid')
        return `Card "${tags.twitterCard}" is invalid. Large card: 2:1, min 300×157, under 5 MB. Summary: 1:1, min 144×144.`;
      if (layout === 'other')
        return `Card "${tags.twitterCard}" is not a link card: X shows its ${tags.twitterCard} layout instead. Link cards are summary and summary_large_image.`;
      if (layout === 'none')
        return `${dropped ? 'Image over 5 MB, dropped' : 'No image'}: a card without a picture. Title up to 70 characters.`;
      return `${layout === 'large' ? 'Large image card, 2:1 centre crop' : 'Summary card, 1:1 thumbnail'}; image ${dims}. Title up to 70 characters, one overlay line.`;
    case 'facebook':
      return `${layout === 'large' ? 'Large image, 1.91:1' : layout === 'small' ? 'Small square thumbnail (image under 600×315)' : dropped ? 'Image over 8 MB, dropped' : 'No image'}; image ${dims}. Title about 2 lines, description 1 line, often hidden on phones.`;
    case 'linkedin':
      return `${dropped ? 'Image over 5 MB, dropped. ' : ''}Organic posts show a small thumbnail beside the title since 2024; no description. Image ${dims}, 1200×627 asked for, 5 MB max.`;
    case 'whatsapp':
      return `${layout === 'large' ? 'Large preview' : 'Small thumbnail'}: large needs 300px+ wide, ratio under 4:1, file under 600 KB. Title 2 lines, description 2 lines.`;
    case 'discord':
      return `${layout === 'large' ? 'Large image below the text (summary_large_image)' : 'Thumbnail on the right (no summary_large_image card)'}. Title 70 bytes / 3 lines, description 350 bytes. Bar ${tags.themeColor} from theme-color.`;
    case 'slack':
      return `${layout === 'large' ? 'Large image below the text (summary_large_image), fitted into 360×500' : 'Thumbnail on the right, longest side 75px (no summary_large_image card)'}. Reads oEmbed, then Twitter/Open Graph, whichever comes first. Layout approximate.`;
    case 'imessage':
      return `${layout === 'icon' ? 'Icon card: no usable image (none, under 150px wide, or over the 10 MB page budget)' : 'Large image card'}; title and domain only, no description. Apple recommends images 900px+ wide. Layout approximate.`;
    default:
      return '';
  }
}
