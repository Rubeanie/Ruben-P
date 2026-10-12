import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { DESCRIPTION_LENGTH, TITLE_LENGTH } from '@/lib/studioReviewLimits';
import { CopyButton } from '../CopyButton';
import { VERDICTS } from '../../seo/checks';

const COLOURS = {
  good: '#30a46c',
  warn: '#f5a524',
  bad: '#e5484d',
  info: '#8690a2'
};
const VERDICT_LEVEL = Object.fromEntries(
  Object.entries(VERDICTS).map(([level, verdict]) => [verdict, level])
);
const VERDICT_WORD = {
  good: 'Good',
  okay: 'Could be better',
  weak: 'Needs work'
};
// The lengths a suggestion should land in; outside them its count turns amber.
const FITS = { Title: TITLE_LENGTH, Description: DESCRIPTION_LENGTH };

function Dot({ level, size = 8 }) {
  return (
    <Box
      aria-hidden
      style={{
        flex: 'none',
        width: size,
        height: size,
        borderRadius: '50%',
        background: COLOURS[level]
      }}
    />
  );
}

// A dot sits on the first line of its text, however many lines the text wraps to.
function Item({ level, children }) {
  return (
    <Flex as='li' gap={3} align='flex-start'>
      <Box style={{ paddingTop: 4 }}>
        <Dot level={level} size={6} />
      </Box>
      <Box flex={1}>
        <Text size={1}>{children}</Text>
      </Box>
    </Flex>
  );
}

function Section({ title, detail, action, children }) {
  return (
    <Card borderTop paddingTop={4}>
      <Stack space={4}>
        <Flex align='center' gap={3}>
          <Stack space={2} flex={1}>
            <Text size={1} weight='medium'>
              {title}
            </Text>
            {detail && (
              <Text size={1} muted>
                {detail}
              </Text>
            )}
          </Stack>
          {action}
        </Flex>
        {children}
      </Stack>
    </Card>
  );
}

// The editor's own words win until they press Use this; then the field holds the suggestion.
function UseButton({ chosen, onUse }) {
  return chosen ? (
    <Badge tone='positive' fontSize={1}>
      Selected
    </Badge>
  ) : (
    <Button
      mode='ghost'
      tone='positive'
      fontSize={1}
      padding={2}
      text='Use this'
      onClick={onUse}
    />
  );
}

function Suggestion({ label, text, chosen, onUse }) {
  const [min, max] = FITS[label];
  const fits = text.length >= min && text.length <= max;
  return (
    <Card padding={3} radius={2} tone='transparent' border>
      <Flex gap={2} align='flex-start'>
        <Stack space={2} flex={1}>
          <Text size={0} muted>
            {label} ·{' '}
            <span style={fits ? undefined : { color: COLOURS.warn }}>
              {text.length} characters
            </span>
          </Text>
          <Text size={1}>{text}</Text>
        </Stack>
        <CopyButton text={text} label={`Copy ${label.toLowerCase()}`} />
        <UseButton chosen={chosen} onUse={onUse} />
      </Flex>
    </Card>
  );
}

function LiveResult({ result }) {
  const level =
    result.score >= 90 ? 'good' : result.score >= 50 ? 'warn' : 'bad';
  return (
    <Stack space={3}>
      <Flex align='center' gap={2}>
        <Dot level={level} />
        <Text size={1} weight='medium'>
          SEO score {result.score}
        </Text>
      </Flex>
      {result.failing.length ? (
        <Stack as='ul' space={3} style={{ margin: 0, padding: 0 }}>
          {result.failing.map((title) => (
            <Item key={title} level='bad'>
              {title}
            </Item>
          ))}
        </Stack>
      ) : (
        <Text size={1} muted>
          Every audit Google could judge passes.
        </Text>
      )}
    </Stack>
  );
}

function Keyphrase({ phrase, reason, chosen, onUse }) {
  return (
    <Card padding={3} radius={2} tone='transparent' border>
      <Flex gap={2} align='center'>
        <Stack space={2} flex={1}>
          <Text size={1} weight='medium'>
            {phrase}
          </Text>
          <Text size={1} muted>
            {reason}
          </Text>
        </Stack>
        <UseButton chosen={chosen} onUse={() => onUse(phrase)} />
      </Flex>
    </Card>
  );
}

// A note goes once the field it is about changes; page notes stay. The verdict
// covers all of it, so any change retires it.
function AiResult({ result, changed, fields, onUse }) {
  const level = VERDICT_LEVEL[result.verdict];
  const outdated = Object.values(changed || {}).some(Boolean);
  const notes = result.notes.filter(
    (note) => note.about === 'page' || !changed?.[note.about]
  );
  const current = fields?.focusKeyphrase?.trim().toLowerCase();
  const holds = (field, text) => fields?.[field]?.trim() === text;
  return (
    <Stack space={4}>
      {outdated ? (
        <Text size={1} muted>
          Your copy has changed since this read. Get suggestions again for a
          fresh verdict.
        </Text>
      ) : (
        <Flex align='center' gap={2}>
          <Dot level={level} />
          <Text size={1} weight='medium'>
            {VERDICT_WORD[result.verdict]}
          </Text>
        </Flex>
      )}
      {notes.length > 0 && (
        <Stack as='ul' space={3} style={{ margin: 0, padding: 0 }}>
          {notes.map((note) => (
            <Item key={`${note.about}:${note.text}`} level={level}>
              {note.text}
            </Item>
          ))}
        </Stack>
      )}
      {result.title && (
        <Suggestion
          label='Title'
          text={result.title}
          chosen={holds('metaTitle', result.title)}
          onUse={() => onUse('metaTitle', result.title)}
        />
      )}
      {result.description && (
        <Suggestion
          label='Description'
          text={result.description}
          chosen={holds('metaDescription', result.description)}
          onUse={() => onUse('metaDescription', result.description)}
        />
      )}
      {result.keyphrases?.length > 0 && (
        <Stack space={2}>
          <Text size={0} muted>
            Focus keyphrase ideas
          </Text>
          {result.keyphrases.map(({ phrase, reason }) => (
            <Keyphrase
              key={phrase}
              phrase={phrase}
              reason={reason}
              chosen={phrase === current}
              onUse={(phrase) => onUse('focusKeyphrase', phrase)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// Advice beside the SEO fields: the draft's own checks, Google's audit of the
// live page and AI suggestions. It writes only when the editor presses Use this,
// and then only the meta title, meta description or focus keyphrase field.
export function SeoPanel({
  report,
  live,
  onLive,
  ai,
  aiChanged,
  onAi,
  fields,
  onUse
}) {
  const toLook = report.items.filter(
    ({ level }) => level === 'warn' || level === 'bad'
  ).length;

  return (
    <Card padding={4} radius={3} border>
      <Stack space={4}>
        <Flex align='center' gap={3}>
          <Dot level={VERDICT_LEVEL[report.verdict]} size={10} />
          <Text size={2} weight='semibold'>
            {VERDICT_WORD[report.verdict]}
          </Text>
          <Text size={1} muted>
            {toLook ? `${toLook} to look at` : 'Nothing to fix'}
          </Text>
        </Flex>
        <Stack as='ul' space={3} style={{ margin: 0, padding: 0 }}>
          {report.items.map(({ level, text }) => (
            <Item key={text} level={level}>
              {text}
            </Item>
          ))}
        </Stack>

        <Section
          title='Live page'
          detail={live.reason ?? `Google's SEO audit of ${live.url}`}
          action={
            <Button
              mode='ghost'
              fontSize={1}
              text='Check live page'
              loading={live.state === 'busy'}
              disabled={!live.url || live.state === 'busy'}
              onClick={onLive}
            />
          }>
          {live.state === 'done' && <LiveResult result={live.result} />}
          {live.state === 'error' && (
            <Text size={1} muted>
              {live.error}
            </Text>
          )}
        </Section>

        <Section
          title='Title, description and keyphrase'
          detail={
            ai.state === 'off'
              ? "AI suggestions aren't set up."
              : (ai.notice ??
                'Ideas for the search copy and a keyphrase to aim for; nothing changes until you press Use this.')
          }
          action={
            ai.state !== 'off' && (
              <Button
                mode='ghost'
                fontSize={1}
                text='Get suggestions'
                loading={ai.state === 'busy'}
                disabled={ai.state === 'busy' || ai.state === 'signedOut'}
                onClick={onAi}
              />
            )
          }>
          {ai.state === 'done' && (
            <AiResult
              result={ai.result}
              changed={aiChanged}
              fields={fields}
              onUse={onUse}
            />
          )}
          {ai.state === 'error' && (
            <Text size={1} muted>
              {ai.error}
            </Text>
          )}
        </Section>
      </Stack>
    </Card>
  );
}
