export const isDev = process.env.NODE_ENV === 'development';

// The site's own address, not the deployment's vercel.app host; literal env reads so Next inlines them.
export function resolveBaseUrl({
  site = process.env.NEXT_PUBLIC_SITE_URL,
  production = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
} = {}) {
  if (site) return site.replace(/\/+$/, '');
  return production ? `https://${production}` : 'http://localhost:3000';
}

export const baseUrl = resolveBaseUrl();

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-19';
