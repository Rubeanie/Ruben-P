import imageUrlBuilder from '@sanity/image-url';
import { dataset, projectId } from '@/lib/env';

// Public env only, so client components can build crop URLs without the read token.
export const imageBuilder = imageUrlBuilder({ projectId, dataset });
