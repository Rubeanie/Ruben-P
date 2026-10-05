import { cache, Suspense } from 'react';
import client from '@/lib/sanity/client';
import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { metadataQuery } from '@/lib/sanity/queries/metadata';
import { modulesQuery } from '@/lib/sanity/queries/modules';
import { authorQuery } from '@/lib/sanity/queries/fragments/author';
import { identityQuery } from '@/lib/sanity/queries/identity';
import { postCardQuery } from '@/lib/sanity/queries/fragments/post-card';
import { firstModule } from '@/lib/modules';
import { introImages } from '@/lib/introImages';
import { pageHrefs } from '@/lib/introPicks';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { Modules } from '@/components/Modules';
import { getSite } from '@/lib/sanity/queries';
import { heroThemeImage, resolveMetadata } from '@/lib/resolveMetadata';
import { getRedirect } from '@/lib/redirects';
import IntentImages from '@/components/IntentImages';
import Redirecting from '@/components/Redirecting';
import Reveal from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import { themeFromImage } from '@/lib/imageTheme';
import { isPagePath } from '@/lib/slug';
import { getShareCard, getVanitySocial } from '@/lib/shareImage/data';
import { DISCORD_SEGMENT } from '@/lib/shareImage/discord.cjs';

export default async function Page({ params }) {
  const { page, path } = await getPage(params);
  if (!page) {
    // The home page is only served at the root, so there's no redirect to check for it.
    if (path !== '/') {
      // No page: check the CMS redirects. Internal targets redirect natively,
      // external ones get the interstitial.
      const target = await getRedirect(path);
      if (target?.url.startsWith('/'))
        (target.permanent ? permanentRedirect : redirect)(target.url);
      if (target) return <Redirecting url={target.url} label={target.label} />;
    }
    notFound();
  }
  // Heroes clear the floating navbar themselves; anything else needs the padding.
  const opensWithHero = firstModule(page.modules)?._type?.startsWith('hero');
  return (
    <div
      className={opensWithHero ? undefined : 'nav-pad'}
      data-reveal={page.animateModules || undefined}>
      <Modules modules={page?.modules} page={page} />
      {page.animateModules && <Reveal />}
      <JsonLd page={page} path={path} />
      <Suspense>
        <PageIntent modules={page.modules} path={path} />
      </Suspense>
    </div>
  );
}

// The pages this one's own links lead to, warmed when a visitor reaches for
// one. Streamed so the lookup never holds up the page.
async function PageIntent({ modules, path }) {
  return <IntentImages images={await introImages(pageHrefs(modules, path))} />;
}

export async function generateMetadata({ params }) {
  const { page, path } = await getPage(params);
  if (page) return resolveMetadata(page, await getSite());
  // Redirects and 404s are handled by the page component; a social's vanity
  // path still shares its own card on the way to the profile.
  const social = isPagePath(path) && (await getVanitySocial(path));
  if (!social) return {};
  const { openGraph, twitter } = resolveMetadata(
    {
      metadata: {
        slug: path,
        seo: { metaTitle: social.title, metaDescription: social.username }
      }
    },
    await getSite()
  );
  return { openGraph, twitter };
}

// First paint of the browser bars in the hero's colour; the handoff takes over after.
export async function generateViewport({ params }) {
  const { page, path, discord } = await getPage(params);
  if (discord) {
    const card = isPagePath(path) && (await getShareCard(path));
    return card ? { themeColor: card.ring } : {};
  }
  const url = heroThemeImage(page);
  if (!url) return {};
  const colors = await themeFromImage(url);
  return colors ? { themeColor: colors.background } : {};
}

export async function generateStaticParams() {
  const slugs = await client.fetch(
    groq`*[
      _type in ['page', 'page.post'] &&
      defined(metadata.slug.current)
    ].metadata.slug.current`
  );

  return [
    // the home route is the CMS page whose slug is /
    { slug: [] },
    // Templates and / itself are served through their own routes.
    ...slugs
      .filter((slug) => isPagePath(slug) && slug !== '/')
      .map((slug) => ({ slug: slug.slice(1).split('/') }))
  ];
}

async function getPage(params) {
  const { slug = [] } = await params;
  const discord = slug[0] === DISCORD_SEGMENT;
  const path = '/' + slug.slice(discord ? 1 : 0).join('/');
  if (!isPagePath(path)) return { page: null, path, discord };
  return { page: await loadPage(path), path, discord };
}

// Once per render: the page, its metadata and its viewport all ask. The query is
// long enough to go out as a POST, which fetch memoisation skips.
const loadPage = cache((path) =>
  fetchSanity(
    groq`*[
      _type in ['page', 'page.post'] &&
      metadata.slug.current == $path
    ][0]{
      _type,
      _updatedAt,
      headingLinks,
      animateModules,
      ${postCardQuery},
      // Posts that name no authors credit the site's default one; compact drops a missing default.
      "authors": array::compact(select(
        count(authors) > 0 => authors[]->{ ${authorQuery} },
        [*[_type == 'site'][0].author->{ ${authorQuery} }]
      )),
      modules[]{ ${modulesQuery} },
      "identity": *[_type == 'site'][0]{ ${identityQuery} },
      ${metadataQuery}
    }`,
    {
      params: { path },
      tags: ['pages', 'posts', 'authors', 'site', 'socials']
    }
  )
);
