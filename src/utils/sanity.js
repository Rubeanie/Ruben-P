import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.NEXT_PUBLIC_SANITY_TOKEN;
const apiVersion = '2022-03-29';
const ignoreBrowserTokenWarning = true;
const perspective = 'published';

const client = createClient({
  // Find your project ID and dataset in `sanity.json` in your studio project
  projectId: projectId,
  dataset: dataset,
  token: token,
  apiVersion: apiVersion, // use a UTC date string
  ignoreBrowserTokenWarning: ignoreBrowserTokenWarning,
  perspective: perspective,
  useCdn: true
});

const server = createClient({
  // Find your project ID and dataset in `sanity.json` in your studio project
  projectId: projectId,
  dataset: dataset,
  token: token,
  apiVersion: apiVersion, // use a UTC date string
  ignoreBrowserTokenWarning: ignoreBrowserTokenWarning,
  perspective: perspective,
  useCdn: false
});

const getThemeUrl = async () => {
  let data = {
    urls: [],
    prioritized: []
  };
  const query = `
  *[_type == "theme"]{
    "urls": assets[]{
      "image": image.secure_url,
      "message": message,
    },
    prioritize
  }`;
  const themes = await server.fetch(query,
    {next: {
      revalidate: 1800
    }}
  );
  for (const theme of themes) {
    if (!theme.prioritize) {
      data.urls.push(...theme.urls);
    } else {
      data.prioritized.push(...theme.urls);
    }
  }
  if (data.prioritized.length === 0) {
    data = data.urls;
  } else {
    data = data.prioritized;
  }
  return data;
};

const GetAboutPageData = async () => {
  const query = `
  *[_type == "aboutPage"] | order(priority asc) {
    _id,
    priority,
    content,
  }`;
  const content = await client.fetch(query);
  return content;
};

export { client, server, getThemeUrl, GetAboutPageData };
