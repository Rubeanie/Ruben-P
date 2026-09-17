import { baseUrl } from '@/lib/env';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/404'
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
