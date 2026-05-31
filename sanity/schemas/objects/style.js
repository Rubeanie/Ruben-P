import { IoMdColorFill } from 'react-icons/io';
import {
  ThemeColorGeneratorInput,
  ThemeStyleInput
} from '../../src/components/ThemeStyleInput';

/* eslint-disable @next/next/no-img-element */
export const style = {
  name: 'style',
  type: 'object',
  icon: IoMdColorFill,
  components: {
    input: ThemeStyleInput
  },
  fieldsets: [
    {
      name: 'themeColors',
      title: 'Color overrides',
      options: {
        collapsible: true,
        collapsed: true
      }
    }
  ],
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'image',
      type: 'cloudinary.asset',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'message',
      type: 'string'
    },
    {
      name: 'colorGenerator',
      title: 'Generate colours',
      type: 'string',
      fieldset: 'themeColors',
      components: {
        input: ThemeColorGeneratorInput
      }
    },
    {
      name: 'primaryColor',
      title: 'Primary color',
      description: 'Overrides primary color.',
      type: 'color',
      fieldset: 'themeColors',
      options: {
        disableAlpha: true
      }
    },
    {
      name: 'secondaryColor',
      title: 'Secondary color',
      description: 'Overrides secondary color.',
      type: 'color',
      fieldset: 'themeColors',
      options: {
        disableAlpha: true
      }
    },
    {
      name: 'backgroundColor',
      title: 'Background color',
      description: 'Overrides background color.',
      type: 'color',
      fieldset: 'themeColors',
      options: {
        disableAlpha: true
      }
    },
    {
      name: 'textColor',
      title: 'Text color',
      description: 'Overrides text color.',
      type: 'color',
      fieldset: 'themeColors',
      options: {
        disableAlpha: true
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'message',
      url: 'image.secure_url'
    },
    prepare({ title, subtitle, url }) {
      return {
        title: title || 'Untitled Style',
        subtitle,

        media:
          url !== undefined ? (
            <img
              src={url}
              alt='Style Preview Image'
              style={{
                height: '100%',
                width: 'auto',
                display: 'block',
                left: 'unset'
              }}
            />
          ) : null
      };
    }
  }
};
