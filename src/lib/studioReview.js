import { baseUrl } from '@/lib/env';
import {
  BUSY,
  createMemberCheck,
  createRateLimit,
  ipOf,
  json
} from '@/lib/studioMember';
import {
  DESCRIPTION_LENGTH,
  MAX_BODY,
  MAX_FLAGS,
  MAX_ITEMS,
  MAX_TEXT,
  TITLE_LENGTH
} from '@/lib/studioReviewLimits';

// Fixed here so a caller can never pick a pricier model or a longer answer.
export const MODEL = 'google/gemini-3.8-flash';
const OPENROUTER = 'https://openrouter.ai/api/v1/chat/completions';

const MAX_KEY = 200;
const MAX_HEADINGS = 40;

// These limits live in memory, so each server instance counts on its own; the
// real cap on spend is the credit limit set on the OpenRouter key.
export const RATE_LIMIT = 30;
export const RATE_WINDOW = 10 * 60_000;

const clip = (value, max = MAX_TEXT) =>
  typeof value === 'string' ? value.slice(0, max) : '';

// Patterns adapted from blader/humanizer (MIT).
const AI_PATTERNS = [
  '1. Not X but Y: "not just X, it\'s Y", "X rather than Y", the contrast split over two sentences, a clipped negative tail ("..., no guessing").',
  '2. One-line closers and dramatic fragments that restate the point ("That is the real win.", "Let that sink in.", "No limits. No rules.").',
  '3. Sayings that sound deep ("at its core", "the real question is", "X is the language of Y").',
  '4. Staged run-ups ("Let\'s dive in", "Here\'s the thing", a standalone "Honestly?") and arguing with no one ("Don\'t get me wrong", "To be clear").',
  '5. Forced threes, the same sentence opening over and over, and stacked hedges.',
  '6. Em or en dashes used as connectors.',
  '7. Stock AI words: delve, tapestry, testament, underscore, pivotal, crucial, interplay, intricate, meticulous, showcase, vibrant, enduring, garner, bolstered, enhance, align with, additionally.',
  '8. Inflated significance ("a pivotal moment", "marking a shift", "the future looks bright"), shallow -ing riders ("..., showcasing", "highlighting", "fostering") and vague "associated with".',
  '9. Sales language (nestled, in the heart of, breathtaking, stunning, renowned, groundbreaking) and borrowed authority ("experts say").',
  '10. "Serves as", "stands as", "boasts", "features" where "is" or "has" would do.',
  '11. Bold, title case, emoji or arrow decoration, and chatbot leftovers ("I hope this helps", "Certainly!").'
].join(' ');

// The house style, read off the site's own pages: first person, casual and
// playful, short punchy headings, pop-culture nods, slang that is clearly on purpose.
const STYLE = [
  'House style:',
  'Australian English spelling (en-AU: colour, organise, centre, travelled).',
  'This is a personal portfolio written by its owner in the first person. The voice is casual, conversational and playful: short punchy headings, plain words, pop-culture and music nods, and the odd bit of deliberate slang. Keep slang and informal spellings, and pronoun pairs like "me and my mate"; they are a choice, not a mistake. A wrong verb form is still a mistake and gets fixed: "I seen" is "I saw", "we was" is "we were", "could of" is "could have".',
  'Keep the author\'s voice, meaning and facts, and make nothing up: no new fact, name, number, claim or boast (never "the best gear" when the writer said nothing of the kind). If a better sentence needs a detail the text lacks, write a simpler sentence.',
  'Good copy here is engaging, plain, specific and concrete, prefers the active voice, and varies sentence length naturally.',
  'Never write like an AI. Your suggestions never contain these patterns:',
  AI_PATTERNS
].join(' ');

// Suggestions that slip into AI habits are dropped unless the author wrote that
// same tell first. Only unambiguous ones: everyday words like "key" or "rich" stay allowed.
const AI_TELLS = [
  /—/,
  /\s–\s/,
  /\bdelv(e|es|ed|ing)\b/i,
  /\bdeep dive\b/i,
  /\btapestr(y|ies)\b/i,
  /\btestament\b/i,
  /\bunderscor(e|es|ed|ing)\b/i,
  /\bpivotal\b/i,
  /\bcrucial role\b/i,
  /\binterplay\b/i,
  /\bintricat(e|ely|ies)\b/i,
  /\bmeticulous(ly)?\b/i,
  /\bbolstered\b/i,
  /\bgarner(s|ed|ing)?\b/i,
  /\bshowcas(e|es|ed|ing)\b/i,
  /\bfostering\b/i,
  /\bvibrant\b/i,
  /\b(serves|served|serving|stands|stood|standing) as\b/i,
  /\bnestled\b/i,
  /\bin the heart of\b/i,
  /\bboasts?\b/i,
  /\bgroundbreaking\b/i,
  /\bbreathtaking\b/i,
  /\bseamless(ly)?\b/i,
  /\bleverag(e|es|ed|ing)\b/i,
  /\belevat(e|es|ed|ing)\b/i,
  /\bembark(s|ed|ing)?\b/i,
  /\bunlock(s|ed|ing)?\b/i,
  /\bin today'?s\b/i,
  /\bit'?s worth noting\b/i,
  /\blet'?s dive in\b/i,
  /\blet that sink in\b/i,
  /\bat its core\b/i,
  /\bnot (just|only|merely)\b[^.!?]*,\s*(it'?s|it is|but)\b/i
];

export const soundsLikeAi = (text, original = '') =>
  AI_TELLS.some((tell) => tell.test(text) && !tell.test(original));

// Each SEO note names the field it is about, so the Studio can retire it once that field changes.
const NOTE_ABOUT = ['title', 'description', 'keyphrase', 'page'];

// Suggested keyphrases are short search phrases with a reason; anything else is dropped.
function keyphrasesOf(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list
    .filter(
      (item) =>
        typeof item?.phrase === 'string' && typeof item.reason === 'string'
    )
    .map((item) => ({
      phrase: item.phrase.trim().toLowerCase().replace(/\s+/g, ' '),
      reason: item.reason.trim()
    }))
    .filter(
      ({ phrase, reason }) =>
        phrase.length >= 2 &&
        phrase.length <= 60 &&
        reason &&
        !seen.has(phrase) &&
        seen.add(phrase) &&
        !soundsLikeAi(phrase) &&
        !soundsLikeAi(reason)
    )
    .slice(0, 3);
}

const TASKS = {
  seo: {
    maxTokens: 2000,
    system: [
      "You review a web page's search title and meta description for its editor.",
      'Judge whether they are specific, compelling and match what the page is about, using the page title, summary, headings and excerpt.',
      'Character counts are checked elsewhere; do not count or mention them.',
      `Return a verdict (good, okay or weak), up to four short notes on what to improve (tag each with what it is about: title, description, keyphrase, or page for anything else), and one suggested title (${TITLE_LENGTH.join(' to ')} characters) and description (${DESCRIPTION_LENGTH.join(' to ')} characters).`,
      'Suggestions are specific to this page and in the same voice: no clickbait, no emoji, no quotes around them. If the current copy is already good, they may stay close to it.',
      'When a focus keyphrase is given, work it into the suggestions naturally where it fits, ideally near the start of the title. Never stuff it or repeat it, and never at the expense of the voice; a note may say where it is missing.',
      'Also suggest up to three focus keyphrases: phrases a real person would type into Google to find this page, 2 to 5 words, lower case, Australian spelling, niche enough for a personal portfolio to rank for ("night car photography melbourne", not "photography"). On a personal or about page the author\'s own name is a fair choice. Each comes from what the page actually covers, never invented or stuffed, with one short line on why it fits. If the title and description are empty, judge them weak and still suggest keyphrases from the page text.',
      STYLE,
      'Reply with JSON only.'
    ].join(' '),
    input(body) {
      return {
        title: clip(body.title, 300),
        description: clip(body.description, 600),
        pageTitle: clip(body.pageTitle, 300),
        keyphrase: clip(body.keyphrase, 100),
        summary: clip(body.summary, 600),
        headings: (Array.isArray(body.headings) ? body.headings : [])
          .slice(0, MAX_HEADINGS)
          .map((heading) => clip(heading, 200)),
        excerpt: clip(body.excerpt)
      };
    },
    schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['good', 'okay', 'weak'] },
        notes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              about: { type: 'string', enum: NOTE_ABOUT },
              text: { type: 'string' }
            },
            required: ['about', 'text'],
            additionalProperties: false
          }
        },
        title: { type: 'string' },
        description: { type: 'string' },
        keyphrases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phrase: { type: 'string' },
              reason: { type: 'string' }
            },
            required: ['phrase', 'reason'],
            additionalProperties: false
          }
        }
      },
      required: ['verdict', 'notes', 'title', 'description', 'keyphrases'],
      additionalProperties: false
    },
    check(out, input) {
      if (!['good', 'okay', 'weak'].includes(out?.verdict)) return null;
      if (!Array.isArray(out.notes)) return null;
      if (typeof out.title !== 'string' || typeof out.description !== 'string')
        return null;
      const keep = (text, original) =>
        soundsLikeAi(text, original) ? '' : text.trim();
      return {
        verdict: out.verdict,
        notes: out.notes
          .filter(
            (note) =>
              NOTE_ABOUT.includes(note?.about) &&
              typeof note.text === 'string' &&
              note.text.trim() &&
              !soundsLikeAi(note.text)
          )
          .map(({ about, text }) => ({ about, text: text.trim() }))
          .slice(0, 4),
        title: keep(out.title, input.title),
        description: keep(out.description, input.description),
        keyphrases: keyphrasesOf(out.keyphrases)
      };
    }
  },
  proofread: {
    maxTokens: 6000,
    system: [
      'You proofread the text of a web page for its editor.',
      'Each item has a key and a passage. Report spelling, grammar and punctuation mistakes, and sentences that read clumsily.',
      'Clumsy means a reader would stumble: the same word repeated close together, chains of "and also", run-on sentences, filler, or a vague word like "good" or "stuff" where the passage already says something more specific. Suggest a tighter version in the same voice, keeping every fact. Leave alone anything that reads fine, even if you would phrase it differently, and skip names, product names, slang, casual constructions like "me and my mate", and deliberate fragments.',
      'Also flag, and rewrite in the same casual first-person voice:',
      'a sentence that does not make sense or is hard to follow;',
      'a tone that jars with that voice, such as stiff or corporate phrasing or a sudden turn formal;',
      'empty filler and weak openers ("This is a page about", "I just wanted to say");',
      'vague claims that say nothing ("high quality work", "passionate about results");',
      'and a sentence that buries its point behind a long run-up.',
      'Be thorough: whatever you leave alone must read smoothly and make sense, so an awkward join ("and with", a stray "but"), a clumsy list or a clunky rhythm is worth a fix. Only a passage that already reads smoothly gets none.',
      'Also flag any of the AI writing patterns listed in the house style below when the passage itself uses them, and rewrite those words plainly. Patterns 1 to 4 count on one sighting; a lone dash, curly quote, hedge or "honestly" in casual writing needs other tells beside it.',
      'Some items carry flags from an automatic spelling checker, each with an id, the flagged words, its message and usually its suggestion. You referee them: list in dismissed the id of every flag that is intentional (slang, names, brand spellings, deliberate fragments, stylistic punctuation such as an ellipsis) or simply wrong. A genuine spelling or grammar error is never dismissed; when unsure, keep the flag. A kept flag whose suggestion is right needs no fix from you. Never dismiss a flag you fix yourself. When the words are wrong but the suggestion is not the best fix for this writer (a clumsy or wrong replacement, or the sentence wants more than a one-word swap), give your own fix covering the flagged words; yours then replaces that suggestion.',
      'For each fix give the key, the exact original words copied from the passage (keep them short, just the words that change plus a little context), the corrected words, and a short reason.',
      'Return an empty list when nothing needs fixing; that is the expected answer for good copy.',
      STYLE,
      'Reply with JSON only.'
    ].join(' '),
    input(body) {
      return {
        items: body.items.map((item) => {
          const text = clip(item.text);
          // Flags past the clipped text point at words the model never sees.
          const flags = (item.flags ?? [])
            .filter((flag) => flag.offset + flag.length <= text.length)
            .map((flag) => ({
              id: flag.id,
              flagged: text.slice(flag.offset, flag.offset + flag.length),
              message: clip(flag.message, 200),
              ...(flag.suggestion && {
                suggestion: clip(flag.suggestion, 100)
              })
            }));
          return flags.length
            ? { key: item.key, text, flags }
            : { key: item.key, text };
        })
      };
    },
    schema: {
      type: 'object',
      properties: {
        fixes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              original: { type: 'string' },
              suggestion: { type: 'string' },
              reason: { type: 'string' }
            },
            required: ['key', 'original', 'suggestion', 'reason'],
            additionalProperties: false
          }
        },
        dismissed: { type: 'array', items: { type: 'string' } }
      },
      required: ['fixes', 'dismissed'],
      additionalProperties: false
    },
    // A fix must quote its own passage, so an invented one never reaches the editor.
    check(out, input) {
      if (!Array.isArray(out?.fixes)) return null;
      const texts = new Map(input.items.map((item) => [item.key, item.text]));
      // Only ids that were sent can be dismissed.
      const ids = new Set(
        input.items.flatMap((item) => (item.flags ?? []).map((f) => f.id))
      );
      const dismissed = [
        ...new Set(
          (Array.isArray(out.dismissed) ? out.dismissed : []).filter((id) =>
            ids.has(id)
          )
        )
      ];
      return {
        dismissed,
        fixes: out.fixes.filter(
          (fix) =>
            ['original', 'suggestion', 'reason'].every(
              (field) => typeof fix?.[field] === 'string'
            ) &&
            fix.original &&
            // An empty suggestion would let Apply delete the passage.
            fix.suggestion.trim() &&
            fix.original !== fix.suggestion &&
            texts.get(fix.key)?.includes(fix.original) &&
            !soundsLikeAi(fix.suggestion, fix.original)
        )
      };
    }
  }
};

// A spelling flag points at real characters of its own passage.
const validFlag = (flag, text) =>
  typeof flag?.id === 'string' &&
  flag.id.length > 0 &&
  flag.id.length <= MAX_KEY &&
  Number.isInteger(flag.offset) &&
  Number.isInteger(flag.length) &&
  flag.offset >= 0 &&
  flag.length > 0 &&
  flag.offset + flag.length <= text.length &&
  typeof flag.message === 'string' &&
  (flag.suggestion === undefined || typeof flag.suggestion === 'string');

// Proofread items arrive from the client, so their shape is checked before any spend.
const validItems = (items) =>
  Array.isArray(items) &&
  items.length > 0 &&
  items.every(
    (item) =>
      typeof item?.key === 'string' &&
      item.key.length <= MAX_KEY &&
      typeof item.text === 'string' &&
      (item.flags === undefined ||
        (Array.isArray(item.flags) &&
          item.flags.length <= MAX_FLAGS &&
          item.flags.every((flag) => validFlag(flag, item.text))))
  );

// Model output sometimes arrives fenced even when JSON was asked for.
export function parseModelJson(content) {
  if (typeof content !== 'string') return null;
  try {
    return JSON.parse(content.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ''));
  } catch {
    return null;
  }
}

export function createReviewHandler({
  fetch: fetcher = (...args) => fetch(...args),
  env = process.env,
  now = Date.now
} = {}) {
  const memberOf = createMemberCheck({ fetch: fetcher, now });
  const limit = { limit: RATE_LIMIT, window: RATE_WINDOW, now };
  // Strangers are slowed before their token costs a call to Sanity.
  const ipOverLimit = createRateLimit(limit);
  const overLimit = createRateLimit(limit);

  return async function POST(request) {
    if (ipOverLimit(ipOf(request)))
      return json({ error: 'too many requests' }, 429);
    const user = await memberOf(request);
    if (!user) return json({ error: 'unauthorised' }, 401);
    if (user === BUSY) return json({ error: 'too many requests' }, 429);

    const key = env.OPENROUTER_API_KEY;
    if (!key) return json({ error: 'not configured' }, 503);

    if (overLimit(user)) return json({ error: 'too many requests' }, 429);

    if (Number(request.headers.get('content-length')) > MAX_BODY)
      return json({ error: 'too large' }, 413);
    const raw = await request.text().catch(() => null);
    if (raw === null) return json({ error: 'bad request' }, 400);
    if (Buffer.byteLength(raw) > MAX_BODY)
      return json({ error: 'too large' }, 413);

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'bad request' }, 400);
    }
    // A literal name only: an array like ["proofread"] would coerce to the key.
    const task =
      typeof body?.task === 'string' &&
      Object.hasOwn(TASKS, body.task) &&
      TASKS[body.task];
    if (!task) return json({ error: 'bad request' }, 400);
    if (body.task === 'proofread') {
      if (Array.isArray(body.items) && body.items.length > MAX_ITEMS)
        return json({ error: 'too many items' }, 413);
      if (!validItems(body.items)) return json({ error: 'bad request' }, 400);
    }

    const input = task.input(body);
    const res = await fetcher(OPENROUTER, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': baseUrl,
        'X-Title': 'Studio writing review'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: task.maxTokens,
        // Copy editing needs no long thinking; it would eat the token budget and the bill.
        reasoning: { effort: 'low', exclude: true },
        messages: [
          { role: 'system', content: task.system },
          { role: 'user', content: JSON.stringify(input) }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: body.task, strict: true, schema: task.schema }
        },
        // Skips providers that would ignore the schema, keep the text or train on it.
        provider: {
          require_parameters: true,
          data_collection: 'deny',
          zdr: true
        }
      }),
      cache: 'no-store',
      // Aborting only frees this function; the provider still bills the full
      // answer. Stops short of the route's own limit so the Studio hears why.
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(55_000)])
    }).catch(() => null);
    if (!res?.ok) return json({ error: 'model unavailable' }, 502);

    const data = await res.json().catch(() => null);
    if (data?.choices?.[0]?.finish_reason === 'length')
      console.warn('review truncated', body.task, data.usage);
    const out = task.check(
      parseModelJson(data?.choices?.[0]?.message?.content),
      input
    );
    if (!out) return json({ error: 'unreadable answer' }, 502);
    return json(out);
  };
}
