export const isDev = process.env.NODE_ENV === 'development';

export const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-08-01';