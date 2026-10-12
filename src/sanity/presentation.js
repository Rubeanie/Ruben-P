import { map } from 'rxjs';
import { isPagePath } from '@/lib/slug';

const TEMPLATE_PATHS = { 404: '/404', redirect: '/redirect' };

export const locations = (params, context) => {
  if (['page', 'page.post'].includes(params.type)) {
    const doc$ = context.documentStore.listenQuery(
      `*[_id == $id][0]{title,metadata}`,
      params,
      { perspective: 'drafts' }
    );

    return doc$.pipe(
      map((doc) => {
        // The slug is the path itself. The templates preview where the site
        // shows them: any unknown path, and a draft-only redirect screen.
        const slug = doc?.metadata?.slug?.current;
        const href = isPagePath(slug) ? slug : TEMPLATE_PATHS[slug];
        if (!href) return null;

        return {
          locations: [
            {
              title: doc.title || doc.metadata?.title || 'untitled',
              href
            }
          ]
        };
      })
    );
  }

  return null;
};
