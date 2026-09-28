import { useEffect, useMemo, useState } from 'react';
import { Spinner, Stack, Text } from '@sanity/ui';
import { getPublishedId, useDocumentStore, useFormValue } from 'sanity';
import { heroThemeImage } from '@/lib/resolveMetadata';
import {
  SITE_BAR_COLOR,
  clampContrast,
  deriveThemeColorsFromPalette,
  themeRendition
} from '@/lib/themes';
import SharePreview from './SharePreview';
import {
  sharePageQuery,
  shareSiteQuery
} from '@/lib/sanity/queries/share-preview';
import { sharePreviewOf } from './share';

// Listeners see raw documents, so the page one watches its draft id as well.
const PAGE = { fetch: sharePageQuery, listen: '*[_id in [$id, $draft]]' };
const SITE = { fetch: shareSiteQuery, listen: "*[_type == 'site']" };
const SITE_DRAFT = {
  fetch: "defined(*[_type == 'site' && _id in path('drafts.**')][0]._id)",
  listen: "*[_type == 'site']"
};
const NO_PARAMS = {};

function useListen(store, query, params, perspective, skip) {
  const [state, setState] = useState({});
  useEffect(() => {
    if (skip) return;
    const sub = store.listenQuery(query, params, { perspective }).subscribe({
      next: (value) => setState({ value }),
      error: (error) => setState({ error })
    });
    return () => sub.unsubscribe();
  }, [store, query, params, perspective, skip]);
  return state;
}

// The server's hero colour rule run in the browser: same rendition, palette and maths.
function useHeroBarColor(url) {
  const [derived, setDerived] = useState({});
  useEffect(() => {
    if (!url) return;
    let live = true;
    import('node-vibrant/browser')
      .then(({ Vibrant }) => Vibrant.from(themeRendition(url)).getPalette())
      .then((palette) => {
        const colors = deriveThemeColorsFromPalette(palette);
        if (live && colors)
          setDerived({ url, color: clampContrast(colors).background });
      })
      // A failed analysis leaves the site bar colour, as it does on the site.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [url]);
  return url && derived.url === url ? derived.color : null;
}

// Sits above the SEO fields; Site settings preview a page that sets nothing of its own.
export function SharePreviewInput(props) {
  const store = useDocumentStore();
  const id = getPublishedId(useFormValue(['_id']) ?? '');
  const isSite = useFormValue(['_type']) === 'site';
  const params = useMemo(() => ({ id, draft: `drafts.${id}` }), [id]);
  // The page as its draft stands; Site settings as published, since that is what ships.
  const page = useListen(store, PAGE, params, 'drafts', isSite);
  const site = useListen(
    store,
    SITE,
    NO_PARAMS,
    isSite ? 'drafts' : 'published'
  );
  const siteDraft = useListen(store, SITE_DRAFT, NO_PARAMS, 'raw', isSite);
  // A document not saved yet has nothing of its own either.
  const shown = isSite || page.value === null ? {} : page.value;
  const heroColor = useHeroBarColor(heroThemeImage(shown));
  const error = page.error || site.error;
  const preview =
    shown &&
    site.value &&
    sharePreviewOf(shown, site.value, heroColor ?? SITE_BAR_COLOR);

  return (
    <Stack space={5}>
      <Stack space={3}>
        <Stack space={2}>
          <Text size={1} weight='medium'>
            Share preview
          </Text>
          <Text size={1} muted>
            {isSite
              ? 'What a page with nothing of its own set sends when it is shared.'
              : 'What this page sends when it is shared, after Site settings fill the gaps.'}
          </Text>
          {siteDraft.value && (
            <Text size={1} muted>
              Site settings has unpublished changes; this uses the published
              values.
            </Text>
          )}
        </Stack>
        {error ? (
          <Text size={1} muted>
            Could not load the preview: {error.message}
          </Text>
        ) : site.value === null ? (
          <Text size={1} muted>
            Create and publish Site settings first.
          </Text>
        ) : preview ? (
          <SharePreview preview={preview} />
        ) : (
          <Spinner muted />
        )}
      </Stack>
      {props.renderDefault(props)}
    </Stack>
  );
}
