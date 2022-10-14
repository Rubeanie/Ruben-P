import React from "react";
import imageUrlBuilder from "@sanity/image-url";

const sanityClient = require("@sanity/client");

const client = sanityClient({
  // Find your project ID and dataset in `sanity.json` in your studio project
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2022-03-29", // use a UTC date string
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  ignoreBrowserTokenWarning: true,
  useCdn: true,
  // useCdn == true gives fast, cheap responses using a globally distributed cache.
  // Set this to false if your application require the freshest possible
  // data always (potentially slightly slower and a bit more expensive).
});

const builder = imageUrlBuilder(client);

function imageUrl(source) {
  return builder.image(source);
}

export { client, imageUrl }