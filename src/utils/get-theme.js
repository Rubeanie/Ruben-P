import { getThemeUrl } from './sanity';
import { Theme } from './themes';

export default async function getTheme() {
  return await getThemeUrl();
}