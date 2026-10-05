import { useState } from 'react';
import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { CopyButton } from '../CopyButton';
import {
  inPageOrder,
  LT_LIMIT_KB,
  matchId,
  sameAsFix,
  wordDiff
} from '../../seo/proofread';
import { fixEdit, matchEdit } from '../../seo/apply';

// The Studio's badge tones: red for what goes, green for what replaces it,
// each on its own ground so both themes keep AA contrast.
const CHIP = { borderRadius: 2, padding: '0 1px' };
const WRONG = {
  ...CHIP,
  color: 'var(--card-badge-critical-fg-color)',
  background: 'var(--card-badge-critical-bg-color)'
};
const STRUCK = { ...WRONG, textDecoration: 'line-through' };
const FLAGGED = {
  ...WRONG,
  textDecoration: 'underline wavy',
  textUnderlineOffset: 3
};
const RIGHT = {
  ...CHIP,
  color: 'var(--card-badge-positive-fg-color)',
  background: 'var(--card-badge-positive-bg-color)'
};
const CONTEXT = 48;

// Applying is offered only where the words sit in one span or string; the
// action re-reads the draft before it writes, and Undo reverts it as usual.
function useApply(apply) {
  const [state, setState] = useState(null);
  const run = (edit, choice) => setState({ choice, result: apply.run(edit) });
  return [state, run];
}

function ApplyButton({ edit, apply, state, choice, run, compact, quiet }) {
  const done = state?.result === 'applied';
  // Checked first: once applied, the draft no longer holds the old words.
  if (done && state.choice === choice)
    return (
      <Box padding={compact ? 1 : 2}>
        <Badge tone='positive' fontSize={compact ? 0 : 1}>
          Applied
        </Badge>
      </Box>
    );
  if (done || !edit || !apply.can(edit)) return null;
  return (
    <Button
      mode={compact || quiet ? 'bleed' : 'ghost'}
      tone='positive'
      fontSize={compact ? 0 : 1}
      padding={compact ? 1 : 2}
      text='Apply'
      onClick={() => run(edit, choice)}
    />
  );
}

// A match's replacements, each copyable and appliable on its own.
function Replacements({ match, apply, state, run, compact }) {
  if (!match.replacements.length) return null;
  return (
    <Flex gap={2} wrap='wrap'>
      {match.replacements.map((text) => (
        <Card
          key={text}
          radius={2}
          tone='transparent'
          border={!compact}
          paddingLeft={compact ? 0 : 2}>
          <Flex align='center' gap={1}>
            <Text size={compact ? 0 : 1}>
              <span style={RIGHT}>{text}</span>
            </Text>
            <CopyButton text={text} label={`Copy "${text}"`} />
            <ApplyButton
              edit={matchEdit(match, text)}
              apply={apply}
              state={state}
              choice={text}
              run={run}
              compact={compact}
            />
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

function Outcome({ state }) {
  if (state?.result !== 'stale') return null;
  return (
    <Flex>
      <Badge tone='critical' fontSize={1}>
        This text has changed; run Proofread again.
      </Badge>
    </Flex>
  );
}

function Entry({ label, source, children }) {
  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        <Flex gap={3} align='center' justify='space-between'>
          <Text size={0} muted>
            {label}
          </Text>
          {typeof source === 'string' ? (
            <Text size={0} muted>
              {source}
            </Text>
          ) : (
            source
          )}
        </Flex>
        {children}
      </Stack>
    </Card>
  );
}

// The flagged words inside the sentence around them.
function InContext({ match: { text, offset, length }, compact }) {
  const from = Math.max(0, offset - CONTEXT);
  const to = Math.min(text.length, offset + length + CONTEXT);
  return (
    <Text size={compact ? 0 : 1} muted={compact}>
      {from > 0 && '…'}
      {text.slice(from, offset)}
      <span style={compact ? { ...FLAGGED, opacity: 0.75 } : FLAGGED}>
        {text.slice(offset, offset + length)}
      </span>
      {text.slice(offset + length, to)}
      {to < text.length && '…'}
    </Text>
  );
}

function Match({ match, apply }) {
  const [state, run] = useApply(apply);
  return (
    <Entry label={match.label} source='Spelling'>
      <Text size={1} weight='medium'>
        {match.message}
      </Text>
      <InContext match={match} />
      <Replacements match={match} apply={apply} state={state} run={run} />
      <Outcome state={state} />
    </Entry>
  );
}

// One suggestion on its own full row, ready to copy or apply. The AI's row
// carries the sparkle; the checker's rows sit quieter beneath it.
function Row({ copy, edit, choice, apply, state, run, ai, children }) {
  return (
    <Card
      className={ai ? 'proofread-ai' : undefined}
      tone={ai ? undefined : 'transparent'}
      radius={2}
      paddingLeft={2}>
      <Flex align='center' gap={1}>
        <Box flex={1} paddingY={2}>
          <Text size={1}>
            {ai && <span className='proofread-spark' aria-hidden='true' />}
            {children}
          </Text>
        </Box>
        <CopyButton text={copy} label={`Copy "${copy}"`} />
        <ApplyButton
          edit={edit}
          apply={apply}
          state={state}
          choice={choice}
          run={run}
          quiet={!ai}
        />
      </Flex>
    </Card>
  );
}

// One LanguageTool error under a better fix. Its replacements settle only
// that error; applying the AI fix settles them all. One that reads the same as
// the AI fix is left out.
function ReplacedMatch({ match, fix, apply, settled }) {
  const [state, run] = useApply(apply);
  const options = match.replacements.filter(
    (text) => !sameAsFix(match, text, fix)
  );
  if (!options.length) return null;
  return (
    <>
      {options.map((text) => (
        <Row
          key={text}
          copy={text}
          edit={settled ? null : matchEdit(match, text)}
          choice={text}
          apply={apply}
          state={state}
          run={run}>
          <span style={STRUCK}>
            {match.text.slice(match.offset, match.offset + match.length)}
          </span>
          {' → '}
          <span style={RIGHT}>{text}</span>
        </Row>
      ))}
      <Outcome state={state} />
    </>
  );
}

function Fix({ fix, apply }) {
  const [state, run] = useApply(apply);
  const { before, after } = wordDiff(fix.original, fix.suggestion);
  const suggestion = (
    <>
      {after[0]}
      <span style={RIGHT}>{after[1]}</span>
      {after[2]}
    </>
  );
  // An AI fix that betters LanguageTool leads, with the checker's own
  // suggestions on the rows below.
  const better = fix.replaced?.length > 0;
  return (
    <Entry
      label={fix.label}
      source={
        better ? (
          <Badge className='proofread-better' fontSize={0}>
            <span className='proofread-spark' aria-hidden='true' />
            Better fix
          </Badge>
        ) : (
          'Wording'
        )
      }>
      <Text size={1}>
        {before[0]}
        <span style={STRUCK}>{before[1]}</span>
        {before[2]}
      </Text>
      {better ? (
        <Stack space={2}>
          <Row
            copy={fix.suggestion}
            edit={fixEdit(fix)}
            choice='fix'
            apply={apply}
            state={state}
            run={run}
            ai>
            {suggestion}
          </Row>
          <Text size={0} muted>
            {`LanguageTool said: ${fix.replaced.map((match) => match.message).join(' ')}`}
          </Text>
          {fix.replaced.map((match) => (
            <ReplacedMatch
              key={matchId(match)}
              match={match}
              fix={fix}
              apply={apply}
              settled={state?.result === 'applied'}
            />
          ))}
        </Stack>
      ) : (
        <Flex align='center' gap={1}>
          <Box flex={1}>
            <Text size={1}>{suggestion}</Text>
          </Box>
          <CopyButton text={fix.suggestion} label='Copy the suggestion' />
          <ApplyButton
            edit={fixEdit(fix)}
            apply={apply}
            state={state}
            choice='fix'
            run={run}
          />
        </Flex>
      )}
      <Text size={1} muted>
        {fix.reason}
      </Text>
      <Outcome state={state} />
    </Entry>
  );
}

// A dismissed flag, kept quiet but still fixable if the editor disagrees.
function IgnoredMatch({ match, apply }) {
  const [state, run] = useApply(apply);
  return (
    <Stack as='li' space={2}>
      <InContext match={match} compact />
      <Text size={0} muted>
        {`“${match.text.slice(match.offset, match.offset + match.length)}”, kept. LanguageTool said: ${match.message}`}
      </Text>
      <Replacements
        match={match}
        apply={apply}
        state={state}
        run={run}
        compact
      />
      <Outcome state={state} />
    </Stack>
  );
}

// Flags the AI judged intentional, out of the way but one press from view.
function Ignored({ matches, apply }) {
  const [open, setOpen] = useState(false);
  if (!matches?.length) return null;
  return (
    <Stack space={2}>
      <Box>
        <Button
          mode='bleed'
          fontSize={1}
          padding={2}
          icon={open ? MdExpandLess : MdExpandMore}
          text={`Left as is: ${matches.length} ${matches.length === 1 ? 'flag' : 'flags'} the AI judged intentional`}
          onClick={() => setOpen(!open)}
        />
      </Box>
      {open && (
        <Stack as='ul' space={4} style={{ margin: 0, paddingLeft: 12 }}>
          {matches.map((match) => (
            <IgnoredMatch key={matchId(match)} match={match} apply={apply} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// One list in page order, both engines together. Nothing changes the page
// until the editor applies or copies a suggestion.
export function ProofreadResults({ spelling, wording, order, apply }) {
  const findings = inPageOrder(spelling.matches, wording.fixes, order);
  const notes = [spelling.error, wording.note].filter(Boolean);
  return (
    <Stack space={4} padding={4}>
      {notes.map((note) => (
        <Text key={note} size={1} muted>
          {note}
        </Text>
      ))}
      {findings.length ? (
        <Stack space={2}>
          {findings.map(({ source, finding }) =>
            source === 'spelling' ? (
              <Match
                key={`s-${matchId(finding)}`}
                match={finding}
                apply={apply}
              />
            ) : (
              <Fix
                key={`w-${finding.key}-${finding.original}-${finding.suggestion}`}
                fix={finding}
                apply={apply}
              />
            )
          )}
        </Stack>
      ) : (
        !notes.length && (
          <Text size={1} muted>
            Nothing to fix. This page reads well.
          </Text>
        )
      )}
      <Stack space={3}>
        <Ignored matches={spelling.ignored} apply={apply} />
        {spelling.partial && (
          <Text size={1} muted>
            {`The page is long; spelling covers its first ${LT_LIMIT_KB} KB of text.`}
          </Text>
        )}
        <Text size={0} muted>
          Spelling and grammar by{' '}
          <a href='https://languagetool.org' target='_blank' rel='noreferrer'>
            LanguageTool
          </a>
        </Text>
      </Stack>
    </Stack>
  );
}
