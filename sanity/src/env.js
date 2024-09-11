import { isDev } from 'sanity';

export const BASE_URL = isDev
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_SITE_URL;