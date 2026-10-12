import { defineConfig } from 'sanity';
import { dataset, projectId } from '@/lib/env';
import { structureTool } from 'sanity/structure';
import structure from '@/sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { locations } from '@/sanity/presentation';
import { inlineSvgInput } from '@focus-reactive/sanity-plugin-inline-svg-input';
import { codeInput } from '@sanity/code-input';
import { colorInput } from '@sanity/color-input';
import { schemaTypes } from '@/sanity/schemaTypes';
import { StudioLogo } from '@/sanity/components/StudioLogo';
import { proofreadInspector } from '@/sanity/components/Proofread/ProofreadInspector';
import { cloudinarySchemaPlugin } from 'sanity-plugin-cloudinary';

const singletonTypes = ['site'];
const proofreadTypes = ['page', 'page.post'];

export default defineConfig({
  title: 'CMS',

  projectId,
  dataset,
  basePath: '/admin',
  // A token login, so the Studio can prove who is asking for AI suggestions.
  auth: { loginMethod: 'token' },
  icon: StudioLogo,

  plugins: [
    structureTool({
      name: 'content',
      title: 'Content',
      structure
    }),
    presentationTool({
      name: 'editor',
      title: 'Editor',
      // The Studio is embedded, so the preview is its own origin.
      previewUrl: {
        previewMode: {
          enable: '/api/draft'
        }
      },
      resolve: { locations }
    }),
    cloudinarySchemaPlugin(),
    inlineSvgInput(),
    codeInput(),
    colorInput()
  ],

  tasks: { enabled: false },
  scheduledPublishing: { enabled: false },
  scheduledDrafts: { enabled: false },
  releases: { enabled: false },
  announcements: { enabled: false },
  mediaLibrary: { enabled: false },
  apps: { canvas: { enabled: false } },
  advancedVersionControl: { enabled: false },

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
    comments: { enabled: false },
    actions: (input, { schemaType }) =>
      singletonTypes.includes(schemaType)
        ? input.filter(
            ({ action }) =>
              action &&
              ['publish', 'discardChanges', 'restore'].includes(action)
          )
        : input,
    inspectors: (input, { documentType }) =>
      proofreadTypes.includes(documentType)
        ? [...input, proofreadInspector]
        : input
  }
});
