import { slug } from "./slug";

export const metadata = (prefix = '') => {
  return {
    name: 'metadata',
    description: 'For search engines',
    type: 'object',
    fields: [
      {
        ...slug(prefix)
      },
      {
        name: 'seo',
        type: 'seoMetaFields'
      }
    ]
  };
};
