import { createImageUrlBuilder } from '@sanity/image-url';
import { dataset, projectId } from '@/lib/env';

// Public env only, so client components can build crop URLs without the read token.
export const imageBuilder = createImageUrlBuilder({ projectId, dataset });

// next/image loader for a post cover: the editor's crop and hotspot apply.
export const coverLoader =
  (cover) =>
  ({ width, quality }) =>
    imageBuilder
      .image(cover)
      .width(width)
      .fit('max')
      .auto('format')
      .quality(quality || 75)
      .url();
