import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { MdRefresh, MdSpellcheck } from 'react-icons/md';
import { useClient, useDocumentOperation, useEditState } from 'sanity';
import { DocumentInspectorHeader } from 'sanity/structure';
import { apiVersion } from '@/lib/env';
import {
  batches,
  checkSpelling,
  proofreadItems,
  dismissalsOf,
  cacheKey,
  cachedCheck,
  distinctFixes,
  replacedBy,
  splitDismissed,
  splitPassages,
  withFlags,
  withoutOverlaps
} from '../../seo/proofread';
import { askReview, reviewProblem, SIGNED_OUT } from '../../seo/review';
import { planEdit } from '../../seo/apply';
import { ProofreadResults } from './ProofreadResults';

const spellingSeen = new Map();
const wordingSeen = new Map();

// One run per document, kept outside the panel so a check carries on, and
// its results stay, after the panel closes.
const IDLE = { phase: 'idle' };
const runs = new Map();
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setRun = (id, state) => {
  runs.set(id, state);
  listeners.forEach((listener) => listener());
};
const useRun = (id) =>
  useSyncExternalStore(subscribe, () => runs.get(id) ?? IDLE);

// AI wording runs batch by batch; a missing key or login leaves it with a quiet note.
async function wordingOf(items, token) {
  if (!token) return { note: SIGNED_OUT };
  const fixes = [];
  const dismissals = [];
  for (const batch of batches(items)) {
    const { status, data } = await askReview(token, {
      task: 'proofread',
      items: batch
    });
    if (status === 503)
      return { note: "AI wording suggestions aren't set up." };
    if (status !== 200)
      return { fixes, dismissals, note: reviewProblem(status) };
    const batchDismissals = dismissalsOf(batch, data.dismissed);
    fixes.push(...data.fixes);
    dismissals.push(...batchDismissals);
    // Kept now, so a later batch failing does not make a retry pay for this one again.
    for (const item of batch)
      wordingSeen.set(cacheKey(item), {
        fixes: data.fixes.filter((fix) => fix.key === item.key),
        dismissals: batchDismissals.filter((d) => d.key === item.key)
      });
  }
  return { fixes, dismissals };
}

async function proofread(doc, token) {
  const items = proofreadItems(doc);
  if (!items.length) return { phase: 'done', empty: true };
  const passages = splitPassages(items);
  // LanguageTool goes first so the AI can referee its flags; each section
  // still reports on its own, and one failing never holds up the other.
  const spelling = await cachedCheck(
    spellingSeen,
    passages,
    checkSpelling,
    'matches'
  ).catch(() => null);
  const matches = spelling?.matches ?? [];
  const ai = await cachedCheck(
    wordingSeen,
    withFlags(passages, matches),
    (fresh) => wordingOf(fresh, token),
    ['fixes', 'dismissals']
  ).catch(() => null);
  const { kept, ignored } = splitDismissed(matches, ai?.dismissals);
  const fixes = distinctFixes(ai?.fixes);
  // A flag the AI rewrites itself is bettered, not left as is, even when it
  // also dismissed it. Repeats go, so a better fix lists each suggestion once.
  const uniqueMatches = withoutOverlaps(matches);
  const bettered = (match) =>
    fixes.some((fix) => replacedBy(fix, [match]).length);
  return {
    phase: 'done',
    order: passages.map((passage) => passage.key),
    spelling: spelling
      ? {
          ...spelling,
          matches: withoutOverlaps(kept, fixes),
          ignored: ignored.filter((match) => !bettered(match))
        }
      : { error: "LanguageTool didn't answer; try again in a minute." },
    wording: ai
      ? {
          ...ai,
          fixes: fixes.map((fix) => ({
            ...fix,
            replaced: replacedBy(fix, uniqueMatches)
          }))
        }
      : { note: 'The AI did not answer; try again in a moment.' }
  };
}

async function start(id, doc, token) {
  if (runs.get(id)?.phase === 'busy') return;
  setRun(id, { ...runs.get(id), phase: 'busy' });
  setRun(id, await proofread(doc, token));
}

// Checks the draft as it stands. It edits only when the editor applies one
// suggestion, and then only that suggestion's words.
function ProofreadPanel({ documentId, documentType, onClose }) {
  const client = useClient({ apiVersion });
  const { draft, published } = useEditState(documentId, documentType);
  const { patch } = useDocumentOperation(documentId, documentType);
  const run = useRun(documentId);
  const doc = draft ?? published;
  const check = () => start(documentId, doc, client.config().token);

  // Opening the panel is the request, once the document has loaded;
  // unchanged passages come from the cache.
  const started = useRef(false);
  useEffect(() => {
    if (!doc || started.current) return;
    started.current = true;
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const apply = {
    // Only a fix spread over several spans is copy-only. One whose words have
    // since changed keeps its button, and says so when pressed.
    can: (edit) => planEdit(doc, edit) !== null,
    run: (edit) => {
      const plan = planEdit(doc, edit);
      if (!plan || plan.stale || patch.disabled) return 'stale';
      patch.execute([{ set: { [plan.path]: plan.value } }]);
      return 'applied';
    }
  };

  const busy = run.phase === 'busy';
  return (
    <Flex direction='column' height='fill' overflow='hidden'>
      <DocumentInspectorHeader
        title='Proofread'
        closeButtonLabel='Close proofread'
        onClose={onClose}
      />
      <Card flex={1} overflow='auto'>
        <Box paddingX={4} paddingTop={4}>
          <Button
            mode='ghost'
            fontSize={1}
            icon={MdRefresh}
            text='Check again'
            loading={busy}
            disabled={!doc}
            onClick={check}
          />
        </Box>
        {/* A re-check keeps the last results up until the new ones land. */}
        {(run.empty || run.spelling) &&
          (run.empty ? (
            <Stack padding={4}>
              <Text size={1} muted>
                There is no text on this page yet.
              </Text>
            </Stack>
          ) : (
            <ProofreadResults
              spelling={run.spelling}
              wording={run.wording}
              order={run.order}
              apply={apply}
            />
          ))}
      </Card>
    </Flex>
  );
}

export const proofreadInspector = {
  name: 'proofread',
  component: ProofreadPanel,
  useMenuItem: () => ({
    icon: MdSpellcheck,
    title: 'Proofread',
    // The header only takes icons; the accent sets it apart from the grey tools.
    tone: 'primary',
    showAsAction: true
  })
};
