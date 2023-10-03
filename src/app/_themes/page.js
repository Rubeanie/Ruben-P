import { getThemeUrl } from '../../lib/sanity';
import { Theme } from './themes';

async function getData() {
  const data = await getThemeUrl();
  return data;
}

export default async function page() {
  return <Theme url={await getData()} />;
}