import { map } from 'rxjs';
import { isPagePath } from '@/lib/slug';

export const locations = (params, context) => {
  if (['page', 'page.post'].includes(params.type)) {
    const doc$ = context.documentStore.listenQuery(
      `*[_id == $id][0]{title,metadata}`,
      params,
      { perspective: 'drafts' }
    );

    return doc$.pipe(
      map((doc) => {
        // The slug is the path itself; templates preview nowhere.
        const slug = doc?.metadata?.slug?.current;
        if (!isPagePath(slug)) return null;

        return {
          locations: [
            {
              title: doc.title || doc.metadata?.title || 'untitled',
              href: slug
            }
          ]
        };
      })
    );
  }

  return null;
};
