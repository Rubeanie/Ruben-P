import { getThemeUrl } from '../../lib/sanity';
import { Theme } from './client';

export default async function page() {
  const data = await getThemeUrl();
  return <Theme url={data} />;
}
