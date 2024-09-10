import client from "@/lib/sanity/client";
import { fetchSanity, groq } from "@/lib/sanity/fetch";
import { metadataQuery } from "@/lib/sanity/queries/metadata";
import { modulesQuery } from "@/lib/sanity/queries/modules";
import { notFound } from "next/navigation";
import { Modules } from "@/components/Modules";
import { processMetadata } from "@/lib/processMetadata";

export default async function Page({ params }) {
  const page = await getPage(params);
  if (!page) notFound();
  return <Modules modules={page?.modules} page={page} />;
}

export async function generateMetadata({ params }) {
  const page = await getPage(params);
  if(!page) notFound();
  return processMetadata(page);
}

export async function generateStaticParams() {
  const slugs = await client.fetch(
    groq`*[
      _type == 'page' &&
      defined(metadata.slug.current) &&
      !(metadata.slug.current in ['index', '404'])
    ].metadata.slug.current`
  )

  return slugs.map((slug) => ({ slug: slug.split('/') }));
}

async function getPage(params) {
  return await fetchSanity(
    groq`*[
      _type == 'page' &&
      metadata.slug.current == $slug &&
      !(metadata.slug.current in ['index', '404'])
    ][0]{
      ...,
      modules[]{ ${modulesQuery} },
      ${metadataQuery}
    }`,
    {
      params: { slug: params.slug.join('/') },
      tags: ['pages']
    }
  );
}