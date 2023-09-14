import { useState, useEffect } from 'react';
import { GetAboutPageData } from '../lib/sanity';
import { PortableText } from '@portabletext/react';

function AboutPageContent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await GetAboutPageData();
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <>
      {data.map((item) => (
        <PortableText key={item._id} value={item.content} />
      ))}
    </>
  );
}

export { AboutPageContent };
