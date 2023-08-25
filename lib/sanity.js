import { createClient } from '@sanity/client'
import seedrandom from 'seedrandom';

const client = createClient({
  // Find your project ID and dataset in `sanity.json` in your studio project
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  useCdn: false, // set to `false` to bypass the edge cache
  apiVersion: "2022-03-29", // use a UTC date string
  ignoreBrowserTokenWarning: true,
})

async function getThemeUrl() {
  const rng = seedrandom.xor4096();
  let data = {
    urls: [],
    prioritized: []
  };
  const query = `
  *[_type == "theme"]{
    "urls": assets[]->{
      "image": image.secure_url,
      "message": message,
    },
    "prioritized": [],
    prioritize == true => {
      "prioritized": assets[]->{
        "image": image.secure_url,
        "message": message,
      }
    }
  }`;
  await client.fetch(query).then((themes) => {
    themes.forEach((theme) => {
      data.urls.push(...theme.urls);
      data.prioritized.push(...theme.prioritized);
    });
  });
  if (data.prioritized.length === 0) {
    data = data.urls;
  } else {
    data = data.prioritized;
  }
  const index = Math.floor(rng() * data.length);
  console.log(`Url: ${data[index].image} | Index: ${index}`);
  if (data[index].message != null) {
    console.log(data[index].message);
  }
  return data[index].image;
}

async function GetAboutPageData() {
  const query = `
  *[_type == "aboutPage"] | order(priority asc) {
    _id,
    priority,
    content,
  }`;
  const content = await client.fetch(query);
  console.log(content)
  return content;
}

export { client, getThemeUrl, GetAboutPageData };