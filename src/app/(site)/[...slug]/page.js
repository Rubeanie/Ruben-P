import client from '@/lib/sanity/client';
import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { metadataQuery } from '@/lib/sanity/queries/metadata';
import { modulesQuery } from '@/lib/sanity/queries/modules';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { Modules } from '@/components/Modules';
import { processMetadata } from '@/lib/processMetadata';
import { getRedirect } from '@/lib/redirects';
import Redirecting from '@/components/Redirecting';

export default async function Page({ params }) {
  const { slug } = await params;
  const page = await getPage({ slug });
  if (!page) {
    // No page: check the CMS redirects. Internal targets redirect natively,
    // external ones get the interstitial.
    const target = await getRedirect(`/${slug.join('/')}`);
    if (target?.url.startsWith('/'))
      (target.permanent ? permanentRedirect : redirect)(target.url);
    if (target) return <Redirecting url={target.url} label={target.label} />;
    notFound();
  }
  return (
    <div className={page.navPadding ? 'nav-pad' : undefined}>
      <Modules modules={page?.modules} page={page} />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const page = await getPage(await params);
  // redirects and 404s are handled by the page component
  if (!page) return {};
  return processMetadata(page);
}

export async function generateStaticParams() {
  const slugs = await client.fetch(
    groq`*[
      _type == 'page' &&
      defined(metadata.slug.current) &&
      !(metadata.slug.current in ['index', '404'])
    ].metadata.slug.current`
  );

  return slugs.map((slug) => ({ slug: slug.split('/') }));
}

async function getPage(params) {
  return await fetchSanity(
    groq`*[
      _type == 'page' &&
      metadata.slug.current == $slug &&
      !(metadata.slug.current in ['index', '404'])
    ][0]{
      title,
      // initialValue only applies to new docs, so older pages default here
      "navPadding": coalesce(navPadding, true),
      modules[]{ ${modulesQuery} },
      ${metadataQuery}
    }`,
    {
      params: { slug: params.slug.join('/') },
      tags: ['pages']
    }
  );
}
