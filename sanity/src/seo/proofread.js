import { blockText } from './text';
import {
  MAX_BODY,
  MAX_FLAGS,
  MAX_ITEMS,
  MAX_TEXT
} from '@/lib/studioReviewLimits';

const MODULE_TITLES = {
  'accordion-list': 'Accordion',
  callout: 'Callout',
  'creative-module': 'Creative',
  hero: 'Hero',
  'hero.saas': 'Hero (Glass)',
  'hero.split': 'Hero (Split)',
  'hero.3d': 'Hero (3D)',
  'richtext-module': 'Rich text',
  'stat-list': 'Stats',
  'skill-list': 'Skills',
  'social-list': 'Socials'
};
const STYLES = {
  normal: 'Paragraph',
  h1: 'Heading 1',
  h1Large: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  blockquote: 'Quote'
};
// Strings a reader sees; everything else in a module is settings, links or ids.
const TEXT_FIELDS = new Set([
  'pretitle',
  'caption',
  'alt',
  'summary',
  'label',
  'text',
  'title',
  'heading',
  'description'
]);
const SKIP_TYPES = new Set(['code', 'reference', 'slug', 'youTube']);

const capitalise = (word) => word[0].toUpperCase() + word.slice(1);
const hasWords = (text) => /\p{L}{2}/u.test(text ?? '');

const pathSegment = (item, i) => (item?._key ? { _key: item._key } : i);

// The page's visible text as short passages, keyed by where each sits in the
// draft. Each also carries its document path and where the trimmed text starts
// in the field, so a fix can be put back exactly where it was found.
export function proofreadItems(doc) {
  const items = [];
  const add = (key, label, raw, path) => {
    if (!hasWords(raw)) return;
    const start = raw.length - raw.trimStart().length;
    items.push({ key, label, text: raw.trim(), path, start });
  };

  add('title', 'Title', doc?.title, ['title']);
  add('summary', 'Summary', doc?.summary, ['summary']);
  const seo = doc?.metadata?.seo;
  const seoPath = ['metadata', 'seo'];
  add('metaTitle', 'Meta title', seo?.metaTitle, [...seoPath, 'metaTitle']);
  add('metaDescription', 'Meta description', seo?.metaDescription, [
    ...seoPath,
    'metaDescription'
  ]);
  add('shareTitle', 'Share title', seo?.openGraph?.title, [
    ...seoPath,
    'openGraph',
    'title'
  ]);
  add('shareDescription', 'Share description', seo?.openGraph?.description, [
    ...seoPath,
    'openGraph',
    'description'
  ]);

  const walk = (value, key, path, title) => {
    if (Array.isArray(value))
      return value.forEach((item, i) =>
        walk(
          item,
          `${key}/${item?._key ?? i}`,
          [...path, pathSegment(item, i)],
          title
        )
      );
    if (!value || typeof value !== 'object' || SKIP_TYPES.has(value._type))
      return;
    if (value._type === 'block')
      return add(
        key,
        `${title} · ${STYLES[value.style] ?? 'Text'}`,
        blockText(value),
        path
      );
    for (const [field, item] of Object.entries(value)) {
      if (field.startsWith('_')) continue;
      if (typeof item === 'string') {
        if (TEXT_FIELDS.has(field))
          add(`${key}/${field}`, `${title} · ${capitalise(field)}`, item, [
            ...path,
            field
          ]);
      } else walk(item, `${key}/${field}`, [...path, field], title);
    }
  };
  for (const [i, mod] of (doc?.modules ?? []).entries())
    walk(
      mod,
      `modules/${mod._key ?? i}`,
      ['modules', pathSegment(mod, i)],
      MODULE_TITLES[mod._type] ?? 'Module'
    );

  return items;
}

const encoder = new TextEncoder();
const bytes = (text) => encoder.encode(text).length;
// Small enough that any one passage fits a request on its own, escaped as JSON.
const PIECE_BYTES = 8000;

// A passage too long for one request is cut at a space into numbered pieces,
// so nothing is truncated on the way.
export function splitPassages(items) {
  return items.flatMap((item) => {
    const pieces = [];
    let rest = item.text;
    while (
      rest.length > MAX_TEXT ||
      bytes(JSON.stringify(rest)) > PIECE_BYTES
    ) {
      let cut = Math.min(rest.length, MAX_TEXT);
      while (bytes(JSON.stringify(rest.slice(0, cut))) > PIECE_BYTES)
        cut = Math.floor(cut * 0.9);
      const space = rest.lastIndexOf(' ', cut);
      if (space > cut / 2) cut = space + 1;
      pieces.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    pieces.push(rest);
    return pieces.length === 1
      ? [item]
      : pieces.map((text, i) => ({
          ...item,
          key: `${item.key}~${i + 1}`,
          text,
          start: item.start + pieces.slice(0, i).join('').length
        }));
  });
}

// Splits passages into requests the route accepts, counted in the bytes it counts.
export function batches(items) {
  const base = bytes(JSON.stringify({ task: 'proofread', items: [] }));
  const out = [];
  let current = [];
  let size = base;
  for (const { key, text, flags } of items) {
    const item = flags?.length ? { key, text, flags } : { key, text };
    const cost = bytes(JSON.stringify(item)) + 1;
    if (
      current.length &&
      (current.length >= MAX_ITEMS || size + cost > MAX_BODY)
    ) {
      out.push(current);
      current = [];
      size = base;
    }
    current.push(item);
    size += cost;
  }
  if (current.length) out.push(current);
  return out;
}

const SEPARATOR = '\n\n';
// The free API takes 20 KB a request and 75 KB a minute, so a page is checked
// in three requests at most, each with room to spare.
const LT_BYTES = 18_000;
const LT_CHUNKS = 3;
export const LT_LIMIT_KB = (LT_BYTES * LT_CHUNKS) / 1000;

// LanguageTool takes one text per request, so passages are joined with blank
// lines and each match is traced back to its passage by offset.
export function languageToolChunks(items, maxBytes = LT_BYTES) {
  const chunks = [];
  let chunk = { text: '', spans: [] };
  for (const item of items) {
    const { text } = item;
    if (chunk.text && bytes(chunk.text + SEPARATOR + text) > maxBytes) {
      chunks.push(chunk);
      chunk = { text: '', spans: [] };
    }
    const start = chunk.text ? chunk.text.length + SEPARATOR.length : 0;
    chunk.text = chunk.text ? chunk.text + SEPARATOR + text : text;
    chunk.spans.push({ item, start, end: start + text.length });
  }
  if (chunk.text) chunks.push(chunk);
  return chunks;
}

export function mapMatches(chunk, matches) {
  return (matches ?? []).flatMap((match) => {
    const span = chunk.spans.find(
      ({ start, end }) => match.offset >= start && match.offset < end
    );
    // A match running past its passage would copy a fix that doesn't fit it.
    if (!span || match.offset + match.length > span.end) return [];
    const offset = match.offset - span.start;
    return [
      {
        key: span.item.key,
        label: span.item.label,
        message: match.message,
        text: span.item.text,
        offset,
        length: match.length,
        replacements: (match.replacements ?? [])
          .slice(0, 3)
          .map((replacement) => replacement.value)
      }
    ];
  });
}

const LANGUAGETOOL = 'https://api.languagetool.org/v2/check';

export async function checkSpelling(items) {
  const chunks = languageToolChunks(items);
  const matches = [];
  for (const chunk of chunks.slice(0, LT_CHUNKS)) {
    const res = await fetch(LANGUAGETOOL, {
      method: 'POST',
      body: new URLSearchParams({ text: chunk.text, language: 'en-AU' }),
      signal: AbortSignal.timeout(20_000)
    });
    if (!res.ok) throw new Error(`LanguageTool answered ${res.status}`);
    matches.push(...mapMatches(chunk, (await res.json()).matches));
  }
  return { matches, partial: chunks.length > LT_CHUNKS };
}

// The words that changed between two versions: shared words at either end are kept plain.
export function wordDiff(before, after) {
  const a = before.split(/(\s+)/);
  const b = after.split(/(\s+)/);
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let end = 0;
  while (
    end < a.length - start &&
    end < b.length - start &&
    a[a.length - 1 - end] === b[b.length - 1 - end]
  )
    end++;
  const parts = (words) => [
    words.slice(0, start).join(''),
    words.slice(start, words.length - end).join(''),
    words.slice(words.length - end).join('')
  ];
  return { before: parts(a), after: parts(b) };
}

// A passage's cache key: its text, plus any spelling flags it carries, so new
// flags on unchanged text still reach the AI to referee.
const cacheKey = (item) =>
  item.flags?.length
    ? JSON.stringify([
        item.text,
        item.flags.map((flag) => [flag.offset, flag.length, flag.message])
      ])
    : item.text;

// Remembers each passage's findings by its text, so a re-run only checks what
// changed. An interrupted or partial answer is shown but not remembered.
// `fields` names the lists in the answer; each finding carries its passage key.
export async function cachedCheck(cache, items, check, fields) {
  const names = [fields].flat();
  if (cache.size > 2000) cache.clear();
  // Each text is checked once; its findings apply to every block that holds it.
  const fresh = [
    ...new Map(
      items
        .filter((item) => !cache.has(cacheKey(item)))
        .map((item) => [cacheKey(item), item])
    ).values()
  ];
  const result = fresh.length ? await check(fresh) : {};
  const found = new Map(
    fresh.map((item) => [
      cacheKey(item),
      Object.fromEntries(
        names.map((name) => [
          name,
          (result[name] ?? []).filter((finding) => finding.key === item.key)
        ])
      )
    ])
  );
  if (!result.partial && !result.note && !result.error)
    for (const [text, findings] of found) cache.set(text, findings);
  const findingsOf = (item, name) =>
    (cache.get(cacheKey(item)) ?? found.get(cacheKey(item)))?.[name] ?? [];
  return {
    ...result,
    ...Object.fromEntries(
      names.map((name) => [
        name,
        items.flatMap((item) =>
          findingsOf(item, name).map((finding) => ({
            ...finding,
            key: item.key,
            label: item.label,
            text: item.text,
            path: item.path,
            start: item.start
          }))
        )
      ])
    )
  };
}

// A LanguageTool match's id: its passage and where it sits there.
export const flagId = (match) => `${match.key}:${match.offset}:${match.length}`;

// LanguageTool's matches ride along with each passage so the AI can referee them.
export function withFlags(passages, matches = []) {
  return passages.map((passage) => {
    const flags = matches
      .filter((match) => match.key === passage.key)
      .slice(0, MAX_FLAGS)
      .map((match) => ({
        id: flagId(match),
        offset: match.offset,
        length: match.length,
        message: match.message ?? '',
        suggestion: match.replacements?.[0] ?? ''
      }));
    return flags.length ? { ...passage, flags } : passage;
  });
}

// The AI's dismissed ids, turned back into places in each passage so they
// survive caching by text and apply to every block that holds it.
export function dismissalsOf(batch, ids = []) {
  const wanted = new Set(ids);
  return batch.flatMap((item) =>
    (item.flags ?? [])
      .filter((flag) => wanted.has(flag.id))
      .map(({ offset, length }) => ({ key: item.key, offset, length }))
  );
}

// Matches the AI judged intentional are set aside, the rest shown.
export function splitDismissed(matches = [], dismissals = []) {
  const ignored = new Set(dismissals.map(flagId));
  return {
    kept: matches.filter((match) => !ignored.has(flagId(match))),
    ignored: matches.filter((match) => ignored.has(flagId(match)))
  };
}

// Every place a fix's words sit in its passage; an AI fix doesn't say which.
function rangesOf(fix) {
  const ranges = [];
  if (!fix.original) return ranges;
  for (
    let at = fix.text?.indexOf(fix.original) ?? -1;
    at >= 0;
    at = fix.text.indexOf(fix.original, at + 1)
  )
    ranges.push([at, at + fix.original.length]);
  return ranges;
}

// Where an AI fix actually changes words, in each place it could sit. A fix
// quoting a whole sentence to add a full stop changes only the last word.
function changedRangesOf(fix) {
  const { before } = wordDiff(fix.original, fix.suggestion ?? '');
  return rangesOf(fix).map(([at]) => {
    const from = at + before[0].length;
    return [from, from + before[1].length];
  });
}

// Whether two [from, to) ranges share any characters.
const overlaps = ([a, b], [c, d]) => a < d && c < b;
const spanOf = (match) => [match.offset, match.offset + match.length];

// One LanguageTool finding's identity: two rules on the same words stay apart.
export const matchId = (match) =>
  JSON.stringify([
    match.key,
    match.offset,
    match.length,
    match.message,
    match.replacements
  ]);

// One AI fix per spot: a repeat, or a fix on words an earlier one already
// rewrites, is dropped. Only a fix whose words sit in one place claims it; one
// that could be anywhere is copy-only and never crowds out a precise fix.
export function distinctFixes(fixes = []) {
  const seen = new Set();
  const claimed = new Map();
  return fixes.filter((fix) => {
    const id = JSON.stringify([fix.key, fix.original, fix.suggestion]);
    if (seen.has(id)) return false;
    seen.add(id);
    const ranges = rangesOf(fix);
    if (ranges.length !== 1) return true;
    const before = claimed.get(fix.key) ?? [];
    if (before.some((range) => overlaps(range, ranges[0]))) return false;
    claimed.set(fix.key, [...before, ranges[0]]);
    return true;
  });
}

// Whether a LanguageTool replacement leaves the passage exactly as the AI fix
// does, so the two would only repeat each other.
export function sameAsFix(match, replacement, fix) {
  const ranges = rangesOf(fix);
  if (ranges.length !== 1) return false;
  const [from, to] = ranges[0];
  const byFix = fix.text.slice(0, from) + fix.suggestion + fix.text.slice(to);
  const byMatch =
    match.text.slice(0, match.offset) +
    replacement +
    match.text.slice(match.offset + match.length);
  return byFix === byMatch;
}

// The LanguageTool matches whose words an AI fix changes. The list shows the fix in their
// place and keeps them beside it, in case the checker had it right.
export function replacedBy(fix, matches = []) {
  const ranges = changedRangesOf(fix);
  return matches.filter(
    (match) =>
      match.key === fix.key &&
      ranges.some((range) => overlaps(range, spanOf(match)))
  );
}

// One finding per spot: an AI rewrite is the fuller fix, so LanguageTool
// matches inside it are dropped, as are LanguageTool's own repeats.
export function withoutOverlaps(matches = [], fixes = []) {
  const covered = new Map();
  for (const fix of fixes)
    covered.set(fix.key, [
      ...(covered.get(fix.key) ?? []),
      ...changedRangesOf(fix)
    ]);
  const seen = new Set();
  return matches.filter((match) => {
    const id = matchId(match);
    if (seen.has(id)) return false;
    seen.add(id);
    return !(covered.get(match.key) ?? []).some((range) =>
      overlaps(range, spanOf(match))
    );
  });
}

// Both engines' findings as one list in page order: passages as proofreadItems
// lists them (`keys`), then by where each finding sits in its passage.
export function inPageOrder(matches = [], fixes = [], keys = []) {
  const rank = new Map(keys.map((key, i) => [key, i]));
  const place = (key) => rank.get(key) ?? keys.length;
  return [
    ...matches.map((finding) => ({
      source: 'spelling',
      finding,
      at: finding.offset
    })),
    ...fixes.map((finding) => ({
      source: 'wording',
      finding,
      at: Math.max(0, finding.text?.indexOf(finding.original) ?? 0)
    }))
  ]
    .sort((a, b) => place(a.finding.key) - place(b.finding.key) || a.at - b.at)
    .map(({ source, finding }) => ({ source, finding }));
}
