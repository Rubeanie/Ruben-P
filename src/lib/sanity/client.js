import { createClient } from 'next-sanity';
import { isDev } from '@/lib/env';
import { projectId, dataset, apiVersion } from '@/lib/env';

export default createClient({
  projectId: projectId,
  dataset: dataset,
  apiVersion: apiVersion,
  useCdn: !isDev,
  stega: {
    enabled: false,
    studioUrl: '/admin'
  }
});
