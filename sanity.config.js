'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\admin\[[...tool]]\page.jsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'

/* TODO:
  * 1. implement presenter
  * 2. implement structure
 */

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/sanity/env';
import {schema} from './src/sanity/schema'

import { media } from 'sanity-plugin-media';
import { codeInput } from '@sanity/code-input';
import { dashboardTool } from '@sanity/dashboard';
import { vercelWidget } from 'sanity-plugin-dashboard-widget-vercel';
import { cloudinaryAssetSourcePlugin } from 'sanity-plugin-cloudinary'

export default defineConfig({
  title: 'Backend',
  basePath: '/admin',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schema' folder
  schema,
  plugins: [
    dashboardTool({
      widgets: [vercelWidget()]
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    cloudinaryAssetSourcePlugin(),
    media(),
    codeInput(),
  ]
});
