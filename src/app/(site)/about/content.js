import { GetAboutPageData } from '../../../utils/sanity';
import { PortableText } from '@portabletext/react';

export async function AboutPageContent() {
  const data = await GetAboutPageData();

  return (
    <>
      {data.map((item) => (
        <PortableText key={item._id} value={item.content} />
      ))}
    </>
  );
}
