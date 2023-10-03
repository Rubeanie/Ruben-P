import { getThemeUrl } from '../lib/sanity';
import { Theme } from '../lib/themes';

export default async function getTheme() {
  return await getThemeUrl();
}