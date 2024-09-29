import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { metadataQuery } from '@/lib/sanity/queries/metadata';
import { modulesQuery } from '@/lib/sanity/queries/modules';
import { Modules } from '@/components/Modules';

export const metadata = {
  title: 'Page cannot be found',
  description: 'Error 404, page cannot be found.'
};

export default async function NotFound() {
  const page = await get404();
  if(!page) return (
    <div className='hero-no-padding'>
      <div className='column'>
        <h2 style={{ marginBlockEnd: '0px' }}>Error</h2>
        <h1>
          <span class='img-heading'>404</span>
        </h1>
        <p>This page could not be found.</p>
      </div>
    </div>
  );
  return <Modules modules={page?.modules} />;
}

async function get404() {
  return await fetchSanity(
    groq`*[_type == 'page' && metadata.slug.current == '404'][0]{
      modules[]{ ${modulesQuery} },
      ${metadataQuery}
    }`,
    { tags: ['404'] }
  );
}
