import { getThemeUrl } from '../sanity';
import { Theme } from './client';

export default async function page() {
  const data = await getThemeUrl();
  return <Theme url={data} />;
}
