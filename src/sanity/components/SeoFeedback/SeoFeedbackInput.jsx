import { useEffect, useMemo, useState } from 'react';
import { Stack } from '@sanity/ui';
import {
  getPublishedId,
  set,
  setIfMissing,
  useClient,
  useEditState,
  useFormValue
} from 'sanity';
import { apiVersion } from '@/lib/env';
import { seoQuery } from '@/lib/sanity/queries/metadata';
import {
  changedSince,
  liveUrl,
  seoChecks,
  seoReviewInput
} from '../../seo/checks';
import { askReview, reviewProblem, SIGNED_OUT } from '../../seo/review';
import { SeoPanel } from './SeoPanel';

const LIVE_PROBLEMS = {
  401: 'Sign out and back in to run the live check.',
  429: 'That is a lot of checks; try again in a few minutes.',
  500: 'Google rejected the PageSpeed key; check PAGESPEED_API_KEY and that the PageSpeed Insights API is enabled for it.',
  503: "Google's quota is used up for now; try later, or set PAGESPEED_API_KEY on the server."
};

// The published Site settings are what fill a page's gaps on the live site.
function useSite() {
  const client = useClient({ apiVersion });
  const [site, setSite] = useState(null);
  useEffect(() => {
    let live = true;
    client
      .fetch(
        `*[_type == 'site'][0]{ ${seoQuery} }`,
        {},
        {
          perspective: 'published'
        }
      )
      .then((value) => live && setSite(value))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [client]);
  return site;
}

// Published pages that already chase the same keyphrase, by title.
const SAME_KEYPHRASE = `*[
  _type in ['page', 'page.post'] &&
  lower(metadata.seo.focusKeyphrase) == lower($keyphrase) &&
  _id != $id &&
  !(_id in path('drafts.**'))
]{ title }`;

function useSameKeyphrase(id, keyphrase) {
  const client = useClient({ apiVersion });
  const [rivals, setRivals] = useState({ keyphrase: '', titles: [] });
  useEffect(() => {
    if (!keyphrase) return;
    let live = true;
    // Typing settles before asking, so each keystroke isn't a query.
    const timer = setTimeout(() => {
      client
        .fetch(SAME_KEYPHRASE, { keyphrase, id }, { perspective: 'published' })
        .then(
          (pages) =>
            live &&
            setRivals({
              keyphrase,
              titles: pages.map((page) => page.title || 'Untitled')
            })
        )
        .catch(() => {});
    }, 500);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [client, id, keyphrase]);
  return rivals.keyphrase === keyphrase ? rivals.titles : [];
}

function SeoFeedback({ doc, fields, onUse }) {
  const client = useClient({ apiVersion });
  const token = client.config().token;
  const site = useSite();
  const id = getPublishedId(doc._id);
  const { published } = useEditState(id, doc._type);
  const rivals = useSameKeyphrase(
    id,
    doc.metadata?.seo?.focusKeyphrase?.trim()
  );
  const report = useMemo(
    () => seoChecks(doc, site, { keyphraseUsedBy: rivals }),
    [doc, site, rivals]
  );
  const target = liveUrl(published);

  const [live, setLive] = useState({ state: 'idle' });
  const [ai, setAi] = useState(
    token ? { state: 'idle' } : { state: 'signedOut', notice: SIGNED_OUT }
  );

  const checkLive = async () => {
    setLive({ state: 'busy' });
    // The members-only route holds the PageSpeed key. Lighthouse takes 10 to
    // 30 seconds; past a minute it has stalled.
    const res = await fetch('/api/studio/pagespeed', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: target.url }),
      signal: AbortSignal.timeout(60_000)
    }).catch(() => null);
    const result = res?.ok && (await res.json().catch(() => null));
    setLive(
      result
        ? { state: 'done', result }
        : {
            state: 'error',
            error:
              LIVE_PROBLEMS[res?.status] ??
              'Google could not check the page; try again in a moment.'
          }
    );
  };

  const suggest = async () => {
    setAi({ state: 'busy' });
    const input = seoReviewInput(doc, site);
    const { status, data } = await askReview(token, { task: 'seo', ...input });
    if (status === 200) setAi({ state: 'done', result: data, read: input });
    else if (status === 503) setAi({ state: 'off' });
    else if (status === 401) setAi({ state: 'signedOut', notice: SIGNED_OUT });
    else setAi({ state: 'error', error: reviewProblem(status) });
  };

  return (
    <SeoPanel
      report={report}
      live={{ ...live, ...target }}
      onLive={checkLive}
      ai={ai}
      aiChanged={
        ai.state === 'done' && changedSince(ai.read, seoReviewInput(doc, site))
      }
      onAi={suggest}
      fields={fields}
      onUse={onUse}
    />
  );
}

// Sits above the page's SEO fields. Site settings only hold defaults, so they get none.
export function SeoFeedbackInput(props) {
  const root = useFormValue([]);
  if (!root?._id || root._type === 'site') return props.renderDefault(props);
  // This object's own value is the freshest after a Use this press; the document
  // read can trail it, so the checks see the SEO fields from here.
  const doc = {
    ...root,
    metadata: { ...root.metadata, seo: props.value ?? root.metadata?.seo }
  };
  // Only on the editor's press, and only one field of this object at a time.
  const write = (field, value) =>
    props.onChange([
      setIfMissing({ _type: props.schemaType.name }),
      set(value, [field])
    ]);
  return (
    <Stack space={5}>
      <SeoFeedback doc={doc} fields={props.value} onUse={write} />
      {props.renderDefault(props)}
    </Stack>
  );
}
