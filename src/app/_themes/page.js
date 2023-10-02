import { getThemeUrl } from '../../lib/sanity';
import { Theme } from './themes';

export default async function page() {
  const data = await getThemeUrl();
  return <Theme url={data} />;
}
