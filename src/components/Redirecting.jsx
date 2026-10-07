import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { modulesQuery } from '@/lib/sanity/queries/modules';
import { Modules } from '@/components/Modules';

// Interstitial for external redirects: a meta refresh in <head> plus a fallback
// link. Content is the CMS page with slug 'redirect' (like the 404 page), which
// reaches the destination through the dynamicValue inline object. `url` comes
// from getRedirect, which has already checked the scheme.
export default async function Redirecting({ url, label }) {
  const page = await fetchSanity(
    groq`*[_type == 'page' && metadata.slug.current == 'redirect'][0]{
      modules[]{ ${modulesQuery} }
    }`,
    { tags: ['redirect-page'] }
  );

  return (
    <>
      <title>Redirecting</title>
      <meta httpEquiv='refresh' content={`0;url=${url}`} />

      {page ? (
        <Modules
          modules={page.modules}
          page={{ values: { 'redirect.destination': { href: url, label } } }}
        />
      ) : (
        <div className='hero-no-padding'>
          <div className='column'>
            <h1>
              <span className='image-text'>REDIRECTING</span>
            </h1>
            <p>
              Stuck? <a href={url}>Open {label ?? url}</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
