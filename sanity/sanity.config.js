'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\admin\[[...tool]]\page.jsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import { structureTool } from 'sanity/structure';

/* TODO:
  * 1. finish schemas
  * 2. implement presenter
  * 3. implement structure
  * 4. implement dashboard
  * 5. unify icons
 */

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './env';
import { schema } from './schemas'

import { media } from 'sanity-plugin-media';
import { seoMetaFields } from 'sanity-plugin-seo';
import { inlineSvgInput } from '@focus-reactive/sanity-plugin-inline-svg-input';
import { codeInput } from '@sanity/code-input';
import { dashboardTool } from '@sanity/dashboard';
import { vercelWidget } from 'sanity-plugin-dashboard-widget-vercel';
import { cloudinarySchemaPlugin, cloudinaryAssetSourcePlugin } from 'sanity-plugin-cloudinary';

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
    structureTool(),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
    cloudinarySchemaPlugin(),
    cloudinaryAssetSourcePlugin(),
    inlineSvgInput(),
    seoMetaFields(),
    codeInput()
  ]
});
