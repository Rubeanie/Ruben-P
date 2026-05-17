import { fetchSanity, groq } from '@/lib/sanity/fetch';
import RichText from '@/components/RichText';

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
        <RichText key={item._id} value={item.content} />
      ))}
    </>
  );
}
