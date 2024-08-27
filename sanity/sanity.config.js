  import { defineConfig } from 'sanity';
  import { BASE_URL, dataset, projectId, apiVersion } from './src/env';
  import { structureTool } from 'sanity/structure';
  import structure from './src/structure';
  import { presentationTool } from 'sanity/presentation';
  import { locations } from './src/presentation';
  import { dashboardTool } from '@sanity/dashboard';
  import { vercelWidget } from 'sanity-plugin-dashboard-widget-vercel';
  import { visionTool } from '@sanity/vision';
  import { media } from 'sanity-plugin-media';
  import { seoMetaFields } from 'sanity-plugin-seo';
  import { inlineSvgInput } from '@focus-reactive/sanity-plugin-inline-svg-input';
  import { codeInput } from '@sanity/code-input';
  import { colorInput } from '@sanity/color-input';
  import { schemaTypes } from './schemas';
  import {
    cloudinarySchemaPlugin,
    cloudinaryAssetSourcePlugin
  } from 'sanity-plugin-cloudinary';

  const singletonTypes = ['site'];

  export default defineConfig({
    title: 'CMS',

    projectId,
    dataset,
    basePath: '/admin',

    plugins: [
      structureTool({
        name: 'content',
        title: 'Content',
        structure
      }),
      presentationTool({
        name: 'editor',
        title: 'Editor',
        previewUrl: {
          draftMode: {
            enable: `${BASE_URL}/api/draft`
          }
        },
        resolve: { locations }
      }),
      visionTool({
        title: 'GROQ',
        defaultApiVersion: apiVersion
      }),
      dashboardTool({
        name: 'deployment',
        title: 'Deployment',
        widgets: [vercelWidget()]
      }),
      media(),
      cloudinarySchemaPlugin(),
      cloudinaryAssetSourcePlugin(),
      inlineSvgInput(),
      seoMetaFields(),
      codeInput(),
      colorInput()
    ],

    tasks: { enabled: false },
    scheduledPublishing: { enabled: false },

    schema: {
      types: schemaTypes,
      templates: (templates) => {
        if (!templates) return [];
        return templates.filter(
          ({ schemaType }) => !singletonTypes.includes(schemaType)
        );
      }
    },

    document: {
      actions: (input, { schemaType }) =>
        singletonTypes.includes(schemaType)
          ? input.filter(
              ({ action }) =>
                action &&
                ['publish', 'discardChanges', 'restore'].includes(action)
            )
          : input
    }
  });
