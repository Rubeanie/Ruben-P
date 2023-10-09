import { getThemeUrl } from './sanity';
import { Theme } from './themes';

// TODO Fix data freshness

export default async function getTheme() {
  return await getThemeUrl();
}