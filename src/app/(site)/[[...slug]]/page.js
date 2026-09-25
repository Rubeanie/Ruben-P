import client from '@/lib/sanity/client';
import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { metadataQuery } from '@/lib/sanity/queries/metadata';
import { modulesQuery } from '@/lib/sanity/queries/modules';
import { authorQuery } from '@/lib/sanity/queries/fragments/author';
import { postCardQuery } from '@/lib/sanity/queries/posts';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { Modules } from '@/components/Modules';
import { processMetadata } from '@/lib/processMetadata';
import processUrl, { resolveLink } from '@/lib/processUrl';
import { stegaClean } from '@sanity/client/stega';
import { getRedirect } from '@/lib/redirects';
import Redirecting from '@/components/Redirecting';

export default async function Page({ params }) {
  const { page, path } = await getPage(params);
  if (!page) {
    if (path) {
      // No page: check the CMS redirects. Internal targets redirect natively,
      // external ones get the interstitial.
      const target = await getRedirect(`/${path}`);
      if (target?.url.startsWith('/'))
        (target.permanent ? permanentRedirect : redirect)(target.url);
      if (target) return <Redirecting url={target.url} label={target.label} />;
    }
    notFound();
  }
  return (
    <div className={page.navPadding ? 'nav-pad' : undefined}>
      <Modules modules={page?.modules} page={page} />
      {page._type === 'page.post' && <ArticleJsonLd page={page} />}
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { page } = await getPage(params);
  // redirects and 404s are handled by the page component
  if (!page) return {};
  return processMetadata(page);
}

export async function generateStaticParams() {
  const slugs = await client.fetch(
    groq`*[
      _type in ['page', 'page.post'] &&
      defined(metadata.slug.current) &&
      !(metadata.slug.current in ['index', '404'])
    ].metadata.slug.current`
  );

  return [
    // the home route is the CMS index page
    { slug: [] },
    ...slugs.map((slug) => ({ slug: slug.split('/') }))
  ];
}

async function getPage(params) {
  const { slug } = await params;
  const path = slug?.join('/');
  const home = !path;
  const page = await fetchSanity(
    groq`*[
      _type in ['page', 'page.post'] &&
      metadata.slug.current == $slug &&
      ($home || !(metadata.slug.current in ['index', '404']))
    ][0]{
      _type,
      _updatedAt,
      ${postCardQuery},
      // Posts that name no authors credit the site's default one; compact drops a missing default.
      "authors": array::compact(select(
        count(authors) > 0 => authors[]->{ ${authorQuery} },
        [*[_type == 'site'][0].author->{ ${authorQuery} }]
      )),
      // initialValue only applies to new docs, so older pages default here
      "navPadding": coalesce(navPadding, true),
      modules[]{ ${modulesQuery} },
      ${metadataQuery}
    }`,
    {
      params: { slug: home ? 'index' : path, home },
      tags: ['pages', 'posts', 'authors']
    }
  );
  return { page, path };
}

// Search engines read the byline from here; the page itself has no fixed header.
function ArticleJsonLd({ page }) {
  const authors = page.authors ?? [];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: stegaClean(page.title),
    description: stegaClean(page.summary),
    datePublished: stegaClean(page.publishDate),
    dateModified: page._updatedAt,
    ...(page.cover?.asset?.url && { image: page.cover.asset.url }),
    ...(authors.length && {
      author: authors.map((author) => {
        const url = resolveLink(author.link);
        return {
          '@type': 'Person',
          name: stegaClean(author.name),
          ...(url?.startsWith('http') && { url })
        };
      })
    }),
    mainEntityOfPage: processUrl(page)
  };
  return (
    <script
      type='application/ld+json'
      // Escape `<` so content containing `</script>` can't break out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
      }}
    />
  );
}
