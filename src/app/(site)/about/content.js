import { fetchSanity, groq } from '@/lib/sanity/fetch';
import { PortableText } from '@portabletext/react';

async function getAboutPageData() {
  return await fetchSanity(
    groq`*[_type == "aboutPage"] | order(priority asc) {
      _id,
      priority,
      content
    }`,
    { tags: ['aboutPage'] }
  );
}

export async function AboutPageContent() {
  const data = await getAboutPageData();

  return (
    <>
      {data.map((item) => (
        <PortableText key={item._id} value={item.content} />
      ))}
    </>
  );
}
