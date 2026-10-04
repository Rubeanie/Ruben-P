import { expect, test } from 'bun:test';
import {
  batches,
  dismissalsOf,
  inPageOrder,
  languageToolChunks,
  mapMatches,
  proofreadItems,
  cachedCheck,
  distinctFixes,
  replacedBy,
  splitDismissed,
  splitPassages,
  withFlags,
  withoutOverlaps,
  wordDiff
} from './proofread';

const block = (_key, style, text) => ({
  _type: 'block',
  _key,
  style,
  children: [{ _type: 'span', text }]
});

const doc = {
  title: 'About',
  metadata: { seo: { metaDescription: 'All about me.' } },
  modules: [
    {
      _type: 'hero',
      _key: 'h',
      pretitle: 'My name is',
      content: [block('b1', 'h1', 'Miles Morales'), block('b2', 'normal', '')],
      ctas: [{ _key: 'c', link: { label: 'Vids', external: 'https://x.y' } }]
    },
    {
      _type: 'stat-list',
      _key: 's',
      stats: [{ _key: 'st', value: '50', text: 'Programming' }]
    },
    { _type: 'code', _key: 'x', code: 'const a = 1;' }
  ]
};

test('collects what a reader sees, keyed by where it sits', () => {
  const items = proofreadItems(doc);
  expect(items.map(({ key, label, text }) => ({ key, label, text }))).toEqual([
    { key: 'title', label: 'Title', text: 'About' },
    {
      key: 'metaDescription',
      label: 'Meta description',
      text: 'All about me.'
    },
    { key: 'modules/h/pretitle', label: 'Hero · Pretitle', text: 'My name is' },
    {
      key: 'modules/h/content/b1',
      label: 'Hero · Heading 1',
      text: 'Miles Morales'
    },
    { key: 'modules/h/ctas/c/link/label', label: 'Hero · Label', text: 'Vids' },
    {
      key: 'modules/s/stats/st/text',
      label: 'Stats · Text',
      text: 'Programming'
    }
  ]);
  expect(items[1].path).toEqual(['metadata', 'seo', 'metaDescription']);
  expect(items[3].path).toEqual([
    'modules',
    { _key: 'h' },
    'content',
    { _key: 'b1' }
  ]);
});

test('split pieces remember where they start in the field', () => {
  const text = 'word '.repeat(3000).trim();
  const pieces = splitPassages([
    { key: 'k', label: 'L', text, path: ['summary'], start: 2 }
  ]);
  for (const piece of pieces)
    expect(text.slice(piece.start - 2).startsWith(piece.text)).toBe(true);
});

test('batches stay inside the route limits', () => {
  const items = Array.from({ length: 130 }, (_, i) => ({
    key: String(i),
    text: 'word '.repeat(20)
  }));
  const sizes = batches(items).map((batch) => batch.length);
  expect(sizes).toEqual([60, 60, 10]);
  // Counted in bytes: four-byte emoji pass a character count but not the route.
  const wide = (key) => ({ key, text: '\u{1F600}'.repeat(1500) });
  expect(batches([wide('a'), wide('b'), wide('c'), wide('d')])).toHaveLength(2);
});

test('a passage too long for one request is split, never cut short', () => {
  const text = 'word '.repeat(3000).trim();
  const pieces = splitPassages([{ key: 'k', label: 'L', text }]);
  expect(pieces.map((piece) => piece.key)).toEqual(['k~1', 'k~2', 'k~3']);
  expect(pieces.map((piece) => piece.text).join('')).toBe(text);
  expect(pieces.every((piece) => piece.text.length <= 6000)).toBe(true);
  expect(batches(pieces).flat()).toHaveLength(3);
});

test('LanguageTool matches land back on their own passage', () => {
  const items = [
    { key: 'a', label: 'A', text: 'Fine text.' },
    { key: 'b', label: 'B', text: 'A speling slip.' }
  ];
  const [chunk] = languageToolChunks(items);
  expect(chunk.text).toBe('Fine text.\n\nA speling slip.');
  const [match] = mapMatches(chunk, [
    {
      message: 'Possible spelling mistake found.',
      offset: chunk.text.indexOf('speling'),
      length: 7,
      replacements: [{ value: 'spelling' }]
    }
  ]);
  expect(match).toMatchObject({
    key: 'b',
    offset: 2,
    length: 7,
    replacements: ['spelling']
  });
});

test('long pages split into several LanguageTool requests', () => {
  const items = Array.from({ length: 5 }, (_, i) => ({
    key: String(i),
    label: '',
    text: 'x'.repeat(5000)
  }));
  expect(languageToolChunks(items).map((c) => c.spans.length)).toEqual([3, 2]);
});

test('wordDiff marks only the changed words', () => {
  expect(wordDiff('Their going home now', "They're going home now")).toEqual({
    before: ['', 'Their', ' going home now'],
    after: ['', "They're", ' going home now']
  });
});

test('a re-run only checks passages whose text changed', async () => {
  const cache = new Map();
  const asked = [];
  const check = async (items) => {
    asked.push(items.map((item) => item.key));
    return {
      fixes: items.map((item) => ({ key: item.key, original: item.text }))
    };
  };
  const first = [
    { key: 'a', text: 'one' },
    { key: 'b', text: 'two' }
  ];
  await cachedCheck(cache, first, check, 'fixes');
  const again = await cachedCheck(
    cache,
    [first[0], { key: 'b', text: 'two, edited' }],
    check,
    'fixes'
  );
  expect(asked).toEqual([['a', 'b'], ['b']]);
  expect(again.fixes.map((fix) => fix.original)).toEqual([
    'one',
    'two, edited'
  ]);
});

test('new spelling flags on unchanged text are refereed again', async () => {
  const cache = new Map();
  let asked = 0;
  const check = async () => {
    asked++;
    return { fixes: [] };
  };
  const plain = { key: 'a', text: 'Teh cat.' };
  const flagged = {
    ...plain,
    flags: [{ id: 'a:0:3', offset: 0, length: 3, message: 'Spelling' }]
  };
  await cachedCheck(cache, [plain], check, 'fixes');
  await cachedCheck(cache, [flagged], check, 'fixes');
  await cachedCheck(cache, [flagged], check, 'fixes');
  expect(asked).toBe(2);
});

test('an incomplete answer is not remembered', async () => {
  const cache = new Map();
  let calls = 0;
  const check = async () => (calls++, { fixes: [], note: 'limit' });
  await cachedCheck(cache, [{ key: 'a', text: 'one' }], check, 'fixes');
  await cachedCheck(cache, [{ key: 'a', text: 'one' }], check, 'fixes');
  expect(calls).toBe(2);
});

test('the same text in two blocks is checked once and flagged in both', async () => {
  const cache = new Map();
  const check = async (items) => ({
    fixes: items.map((item) => ({ key: item.key, original: item.text }))
  });
  const out = await cachedCheck(
    cache,
    [
      { key: 'a', text: 'same' },
      { key: 'b', text: 'same' }
    ],
    check,
    'fixes'
  );
  expect(out.fixes.map((fix) => fix.key)).toEqual(['a', 'b']);
});

test('an interrupted run still flags every block with that text', async () => {
  const check = async (items) => ({
    fixes: items.map((item) => ({ key: item.key, original: item.text })),
    note: 'limit'
  });
  const out = await cachedCheck(
    new Map(),
    [
      { key: 'a', text: 'same' },
      { key: 'b', text: 'same' }
    ],
    check,
    'fixes'
  );
  expect(out.fixes.map((fix) => fix.key)).toEqual(['a', 'b']);
});

test('an AI rewrite hides the LanguageTool matches inside it', () => {
  const rich = 'This is a rich test test';
  const clunky =
    'The shoot was really fun, but tough and with terrible lighting. Still, the photos came out great in the end.';
  const lt = (key, text, word, at = text.indexOf(word)) => ({
    key,
    text,
    offset: at,
    length: word.length
  });
  const matches = [
    lt('a', rich, 'test test'),
    lt('b', clunky, 'fun,'),
    lt('b', clunky, 'Still,'),
    lt('b', clunky, 'terrible'),
    lt('c', 'Teh end', 'Teh'),
    lt('c', 'Teh end', 'Teh')
  ];
  const fixes = [
    {
      key: 'a',
      text: rich,
      original: 'rich test test',
      suggestion: 'rich test'
    },
    {
      key: 'b',
      text: clunky,
      original: clunky,
      suggestion:
        'The shoot was fun but tough, and the lighting was rough. The photos still came out great.'
    }
  ];
  expect(withoutOverlaps(matches, fixes)).toEqual([lt('c', 'Teh end', 'Teh')]);
});

test('a repeated AI original guards every place it appears', () => {
  const text = 'Our team is great. Our team is grate at design.';
  const matches = [
    { key: 'a', text, offset: text.indexOf('grate'), length: 5 },
    { key: 'a', text, offset: 4, length: 4 }
  ];
  const fixes = [{ key: 'a', text, original: 'team', suggestion: 'crew' }];
  expect(withoutOverlaps(matches, fixes)).toEqual([matches[0]]);
  expect(withoutOverlaps(matches, undefined)).toEqual(matches);
});

test('a kept flag the AI fixes better shows only the AI fix', () => {
  const text = 'Their going too the beach.';
  const flag = {
    key: 'a',
    text,
    offset: 0,
    length: 5,
    replacements: ['There']
  };
  const { kept } = splitDismissed([flag], []);
  const fixes = [
    {
      key: 'a',
      text,
      original: 'Their going too',
      suggestion: "They're going to"
    }
  ];
  expect(withoutOverlaps(kept, fixes)).toEqual([]);
  // ...and keeps the checker's answer beside it.
  expect(replacedBy(fixes[0], kept)).toEqual([flag]);
  expect(replacedBy(fixes[0], [{ ...flag, offset: 16 }])).toEqual([]);
  expect(inPageOrder([], fixes, ['a'])).toHaveLength(1);
});

test('repeated or overlapping AI fixes collapse to the first', () => {
  const text = 'We was going too the beach.';
  const fix = (original, key = 'a') => ({
    key,
    text,
    original,
    suggestion: 'x'
  });
  const fixes = [
    fix('We was'),
    fix('We was'),
    fix('was going'),
    fix('too the'),
    fix('We was', 'b')
  ];
  expect(distinctFixes(fixes)).toEqual([fixes[0], fixes[3], fixes[4]]);
  expect(distinctFixes(undefined)).toEqual([]);
});

test('an AI fix that could sit anywhere never crowds out a precise one', () => {
  const text = 'Bad words. Bad words here.';
  const loose = { key: 'a', text, original: 'Bad words', suggestion: 'x' };
  const precise = {
    key: 'a',
    text,
    original: 'Bad words here',
    suggestion: 'y'
  };
  expect(distinctFixes([loose, precise])).toEqual([loose, precise]);
});

test('two different findings on the same words are both kept', () => {
  const match = { key: 'a', offset: 0, length: 4, replacements: ['x'] };
  const out = withoutOverlaps(
    [
      { ...match, message: 'Spelling' },
      { ...match, message: 'Style' }
    ],
    []
  );
  expect(out).toHaveLength(2);
});

test('LanguageTool matches ride with their passage and come back as places', () => {
  const passages = [
    { key: 'a', text: 'Check out da gram…' },
    { key: 'b', text: 'Fine.' }
  ];
  const matches = [
    {
      key: 'a',
      offset: 10,
      length: 2,
      message: 'Did you mean "dag"?',
      replacements: ['dag']
    },
    { key: 'a', offset: 17, length: 1, message: 'Ellipsis' },
    { key: 'a', offset: 0, length: 5, message: 'Real slip' }
  ];
  const sent = withFlags(passages, matches);
  expect(sent[0].flags.map((flag) => flag.id)).toEqual([
    'a:10:2',
    'a:17:1',
    'a:0:5'
  ]);
  // The AI sees the checker's first suggestion, so it can offer a better one.
  expect(sent[0].flags.map((flag) => flag.suggestion)).toEqual(['dag', '', '']);
  expect(sent[1].flags).toBeUndefined();
  expect(batches(sent)[0][0].flags).toHaveLength(3);

  const dismissals = dismissalsOf(sent, ['a:10:2', 'a:17:1', 'b:0:1']);
  expect(dismissals).toEqual([
    { key: 'a', offset: 10, length: 2 },
    { key: 'a', offset: 17, length: 1 }
  ]);
  const { kept, ignored } = splitDismissed(matches, dismissals);
  expect(kept).toEqual([matches[2]]);
  expect(ignored).toEqual(matches.slice(0, 2));
  // With no AI answer every match stays.
  expect(splitDismissed(matches, undefined).kept).toEqual(matches);
});

test('remembered dismissals follow the text into every block that holds it', async () => {
  const cache = new Map();
  let calls = 0;
  const check = async (fresh) => {
    calls++;
    return {
      fixes: [],
      dismissals: fresh.map((item) => ({ key: item.key, offset: 6, length: 2 }))
    };
  };
  const text = 'Check da gram';
  await cachedCheck(cache, [{ key: 'one', text }], check, [
    'fixes',
    'dismissals'
  ]);
  const again = await cachedCheck(cache, [{ key: 'two', text }], check, [
    'fixes',
    'dismissals'
  ]);
  expect(calls).toBe(1);
  expect(again.dismissals).toMatchObject([
    { key: 'two', offset: 6, length: 2 }
  ]);
  const { ignored } = splitDismissed(
    [{ key: 'two', offset: 6, length: 2 }],
    again.dismissals
  );
  expect(ignored).toHaveLength(1);
});

test('findings from both engines list in page order', () => {
  const text = 'Their going home. Teh end.';
  const matches = [
    { key: 'b', offset: 18, length: 3 },
    { key: 'title', offset: 0, length: 2 },
    { key: 'b', offset: 0, length: 5 }
  ];
  const fixes = [
    { key: 'b', text, original: 'going home', suggestion: 'heading home' },
    { key: 'a', text: 'Hi there', original: 'there', suggestion: 'all' }
  ];
  const listed = inPageOrder(matches, fixes, ['title', 'a', 'b']).map(
    ({ source, finding }) =>
      `${source}:${finding.key}:${finding.offset ?? finding.original}`
  );
  expect(listed).toEqual([
    'spelling:title:0',
    'wording:a:there',
    'spelling:b:0',
    'wording:b:going home',
    'spelling:b:18'
  ]);
  expect(inPageOrder(undefined, undefined, [])).toEqual([]);
});
