import createImageUrlBuilder from '@sanity/image-url'

import { dataset, projectId } from '@/lib/env';

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source) => {
  return builder.image(source)
}
