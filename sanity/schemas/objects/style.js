import Color from 'color';
import { IoMdColorFill } from 'react-icons/io';
import { INKS } from '@/lib/posts';
import {
  ThemeColorGeneratorInput,
  ThemeStyleInput
} from '../../src/components/ThemeStyleInput';
import { COLOR_FIELDS } from '../../src/imageColors';

export const style = {
  name: 'style',
  type: 'object',
  icon: IoMdColorFill,
  components: {
    input: ThemeStyleInput
  },
  // Blank colours are worked out in each visitor's browser; saved ones load instantly.
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value?.image) return true;
      const blank = COLOR_FIELDS.filter(({ field }) => !value[field]?.hex);
      if (!blank.length) return true;
      return `${blank.length} colour${blank.length > 1 ? 's are' : ' is'} blank, so the site works ${blank.length > 1 ? 'them' : 'it'} out in each visitor's browser. Press Generate missing to save ${blank.length > 1 ? 'them' : 'it'} now.`;
    }).warning(),
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
      },
      // Buttons, chips and the announcement draw dark text on the primary.
      validation: (Rule) =>
        Rule.custom(
          (value) =>
            !value?.hex ||
            Color(value.hex).contrast(Color(INKS.dark)) >= 4.5 ||
            'Too dark for the dark text drawn on it (under 4.5:1).'
        ).warning()
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
