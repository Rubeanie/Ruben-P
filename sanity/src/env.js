import { isDev } from 'sanity';

export const BASE_URL = isDev
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_VERCEL_URL;

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-08-01';