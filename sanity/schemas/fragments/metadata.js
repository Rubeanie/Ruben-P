import { slug } from './slug';
import { SharePreviewInput } from '../../src/components/SharePreview/SharePreviewInput';

export const metadata = (prefix = '') => {
  return {
    name: 'metadata',
    description: 'For search engines',
    type: 'object',
    components: { input: SharePreviewInput },
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
