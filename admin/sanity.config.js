import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'

// https://www.sanity.io/docs/migrating-from-v2
// https://www.sanity.io/docs/example-migrating-the-blog-template-from-studio-v2-to-v3
// https://www.sanity.io/docs/migrating-studio-configuration

export default defineConfig({
  title: 'Ruben-P',
  projectId: process.env.SANITY_STUDIO_DATASET,
  dataset: process.env.SANITY_STUDIO_PROJECT_ID || 'production',
  plugins: [deskTool()],
  schema: {
    types: [],
  },
});