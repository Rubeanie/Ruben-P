import { HERO_PHOTO_FIELDS } from '@/lib/heroPhotos';
import { resolveMetadata } from '@/lib/resolveMetadata';
import processUrl, { slugOf } from '@/lib/processUrl';
import { isPagePath, templateSlugs } from '@/lib/slug';
import { baseUrl } from '@/lib/env';
import { DESCRIPTION_LENGTH, TITLE_LENGTH } from '@/lib/studioReviewLimits';
import { blockText } from './text';

const LEVELS = { h1: 1, h1Large: 1, h2: 2, h3: 3 };
// Info items are hints, so they sit last and never count against the verdict.
const RANK = { bad: 0, warn: 1, good: 2, info: 3 };
// The page's verdict from its worst item.
export const VERDICTS = { bad: 'weak', warn: 'okay', good: 'good' };

export const textOf = (block) => blockText(block).trim();

// Every portable text block in reading order, however deep a module keeps it.
export function blocksOf(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => blocksOf(item, out));
  else if (value && typeof value === 'object') {
    if (value._type === 'block') out.push(value);
    else
      for (const [key, item] of Object.entries(value))
        if (!key.startsWith('_')) blocksOf(item, out);
  }
  return out;
}

// Every heading the page renders, in order: rich text headings, Creative
// heading blocks and accordion questions (both h3, as anchors.js counts them).
export function headingsOf(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => headingsOf(item, out));
  else if (value && typeof value === 'object') {
    if (value._type === 'block') {
      if (LEVELS[value.style])
        out.push({ level: LEVELS[value.style], text: textOf(value) });
    } else if (value._type === 'heading') {
      if (value.text?.trim()) out.push({ level: 3, text: value.text.trim() });
    } else if (value._type === 'accordion-list') {
      for (const item of value.items ?? []) {
        if (item.summary?.trim())
          out.push({ level: 3, text: item.summary.trim() });
        headingsOf(item.content, out);
      }
    } else
      for (const [key, item] of Object.entries(value))
        if (!key.startsWith('_')) headingsOf(item, out);
  }
  return out;
}

// Heroes render their photo's alt; image blocks may sit inside any rich text.
function imagesWithoutAlt(modules) {
  let missing = 0;
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (value._type === 'imageBlock') {
      if (value.image?.asset && !value.alt?.trim()) missing++;
      return;
    }
    Object.values(value).forEach(visit);
  };
  for (const mod of modules ?? []) {
    const field = HERO_PHOTO_FIELDS[mod._type];
    if (field && mod[field]?.asset && !mod[`${field}Alt`]?.trim()) missing++;
    visit(mod);
  }
  return missing;
}

// The photo the generated share card draws, in the card's own order.
function cardPhoto(doc) {
  if (doc.cover?.asset) return 'cover';
  const hero = doc.modules?.[0];
  if (hero?._type === 'hero' && hero.bgImage?.asset) return 'hero';
  if (['hero.saas', 'hero.split'].includes(hero?._type) && hero.image?.asset)
    return 'hero';
  return null;
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function titleItem(title) {
  const [min, max] = TITLE_LENGTH;
  const n = title.length;
  if (!n) return ['bad', 'No title. Add a meta title or a page title.'];
  if (n < min)
    return ['warn', `Title is ${n} characters; aim for ${min}-${max}.`];
  if (n > max)
    return [
      'warn',
      `Title is ${n} characters; search results cut it off near ${max}.`
    ];
  return ['good', `Title is ${n} characters.`];
}

function descriptionItem(own, shipped) {
  if (!shipped)
    return [
      'bad',
      'No description. Search engines will pick a snippet from the page.'
    ];
  if (!own)
    return [
      'warn',
      'No description of its own; the Site settings one ships, the same on every such page.'
    ];
  const [min, max] = DESCRIPTION_LENGTH;
  const n = own.length;
  if (n < min)
    return [
      n < 70 ? 'bad' : 'warn',
      `Description is ${n} characters; aim for ${min}-${max}.`
    ];
  if (n > max)
    return [
      'warn',
      `Description is ${n} characters; search results cut it off near ${max}.`
    ];
  return ['good', `Description is ${n} characters.`];
}

function shareItem(doc) {
  if (doc.metadata?.seo?.openGraph?.image?.asset)
    return ['good', 'Share image set by hand.'];
  const photo = cardPhoto(doc);
  if (photo)
    return ['good', `Shares the generated card with the ${photo} photo.`];
  return [
    'warn',
    'The generated share card has no photo; set a share image or give the page a hero photo.'
  ];
}

function headingItems(headings) {
  const items = [];
  const h1s = headings.filter((h) => h.level === 1);
  if (!h1s.length)
    items.push([
      'bad',
      'No Heading 1. Give the hero or the first rich text block one.'
    ]);
  else if (h1s.length > 1)
    items.push([
      'warn',
      `${h1s.length} Heading 1s; keep one and make the rest Heading 2.`
    ]);
  else items.push(['good', `One Heading 1: "${h1s[0].text}".`]);

  let previous = 1;
  for (const { level, text } of headings) {
    if (level > previous + 1)
      items.push([
        'warn',
        `"${text}" jumps from Heading ${previous} to Heading ${level}; use Heading ${previous + 1}.`
      ]);
    previous = level;
  }
  return items;
}

// Lower case words with punctuation gone, so "Car-photography," reads as two words.
const wordsOf = (text) =>
  (text ?? '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

// A plain s or es plural is the same word; anything subtler is left to the writer.
const sameWord = (a, b) =>
  a === b || a === `${b}s` || b === `${a}s` || a === `${b}es` || b === `${a}es`;

// Whether the phrase appears as whole words, in order, anywhere in the text.
export function hasPhrase(text, phrase) {
  const want = wordsOf(phrase);
  const words = wordsOf(text);
  if (!want.length) return false;
  for (let i = 0; i + want.length <= words.length; i++)
    if (want.every((word, j) => sameWord(words[i + j], word))) return true;
  return false;
}

const paragraphsOf = (modules) =>
  blocksOf(modules)
    .filter((block) => !LEVELS[block.style])
    .map(textOf)
    .filter(Boolean);

function keyphraseItems(doc, meta, usedBy) {
  const phrase = doc?.metadata?.seo?.focusKeyphrase?.trim();
  if (!phrase)
    return [
      [
        'info',
        "Add a focus keyphrase to check it's used where search engines look."
      ]
    ];
  const h1s = headingsOf(doc?.modules)
    .filter((h) => h.level === 1)
    .map((h) => h.text)
    .join(' ');
  const places = [
    ['the title', meta.title],
    ['the description', meta.description],
    ['the Heading 1', h1s],
    ['the first paragraph', paragraphsOf(doc?.modules)[0] ?? ''],
    ['the URL', slugOf(doc)]
  ];
  const items = places.map(([where, text]) =>
    hasPhrase(text, phrase)
      ? ['good', `Keyphrase is in ${where}.`]
      : ['warn', `Keyphrase isn't in ${where}.`]
  );
  if (usedBy.length)
    items.push([
      'warn',
      `"${usedBy[0]}"${usedBy.length > 1 ? ` and ${plural(usedBy.length - 1, 'other page')}` : ''} already ${usedBy.length > 1 ? 'use' : 'uses'} this keyphrase, so they compete for it.`
    ]);
  return items;
}

// What the page ships, judged field by field; advice only, nothing here blocks publishing.
// `keyphraseUsedBy` holds the titles of other published pages with the same keyphrase.
export function seoChecks(doc, site, { keyphraseUsedBy = [] } = {}) {
  if (templateSlugs.includes(slugOf(doc)))
    return {
      verdict: 'good',
      items: [
        {
          level: 'good',
          text: 'This page holds a not-found or redirect screen, so search engines never see it.'
        }
      ]
    };

  const meta = resolveMetadata(doc, site);
  const own = doc?.metadata?.seo ?? {};
  const findings = [
    titleItem(meta.title.trim()),
    descriptionItem(own.metaDescription?.trim(), meta.description.trim()),
    shareItem(doc ?? {}),
    ...headingItems(headingsOf(doc?.modules)),
    ...keyphraseItems(doc, meta, keyphraseUsedBy)
  ];

  const noAlt = imagesWithoutAlt(doc?.modules);
  if (noAlt)
    findings.push([
      'warn',
      `${plural(noAlt, 'image')} without alt text. Describe what each shows, or leave it empty only when it is decoration.`
    ]);

  if (!meta.robots.index)
    findings.push([
      'warn',
      own.nofollowAttributes == null
        ? 'Site settings has Prevent indexing on, so search engines leave this page out.'
        : 'Prevent indexing is on, so search engines leave this page out.'
    ]);

  const items = findings
    .map(([level, text]) => ({ level, text }))
    .sort((a, b) => RANK[a.level] - RANK[b.level]);
  const worst = items[0]?.level;
  return {
    verdict: VERDICTS[worst] ?? 'good',
    items
  };
}

// What the AI step reads: the shipped title and description beside the page they describe.
export function seoReviewInput(doc, site) {
  const meta = resolveMetadata(doc, site);
  return {
    title: meta.title,
    description: meta.description,
    pageTitle: doc?.title ?? '',
    keyphrase: doc?.metadata?.seo?.focusKeyphrase?.trim() ?? '',
    summary: doc?.summary ?? '',
    headings: headingsOf(doc?.modules).map((h) => h.text),
    excerpt: paragraphsOf(doc?.modules).join('\n').slice(0, 3000)
  };
}

// Which of the copy the AI read has changed since; its notes on those no longer apply.
export const changedSince = (read, now) => ({
  title: read.title !== now.title,
  description: read.description !== now.description,
  keyphrase: read.keyphrase !== now.keyphrase
});

// The published page's address, or why it can't be checked from the outside.
export function liveUrl(published) {
  if (!published) return { reason: 'Publish the page to check it live.' };
  if (!isPagePath(slugOf(published)))
    return { reason: 'This page has no public address to check.' };
  if (/\/\/(localhost|127\.|192\.168\.|10\.)/.test(baseUrl))
    return {
      reason: "The live check needs the site's public address, not localhost."
    };
  return { url: processUrl(published) };
}

// Lighthouse's SEO score and the audits it failed, minus the ones it can't judge.
export function psiSummary(data) {
  const lighthouse = data?.lighthouseResult;
  const category = lighthouse?.categories?.seo;
  if (!category) return null;
  const failing = category.auditRefs
    .map((ref) => lighthouse.audits?.[ref.id])
    .filter(
      (audit) =>
        audit &&
        audit.score !== null &&
        audit.score < 1 &&
        !['manual', 'notApplicable'].includes(audit.scoreDisplayMode)
    )
    .map((audit) => audit.title);
  return { score: Math.round(category.score * 100), failing };
}
