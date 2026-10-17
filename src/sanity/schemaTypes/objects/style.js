import Color from 'color';
import { IoMdColorFill } from 'react-icons/io';
import { INKS } from '@/lib/posts';
import {
  ThemeColorGeneratorInput,
  ThemeStyleInput
} from '../../components/ThemeStyleInput';
import { COLOR_FIELDS } from '../../imageColors';
import { CloudinaryPreview } from '../../components/CloudinaryPreview';

export const style = {
  name: 'style',
  type: 'object',
  icon: IoMdColorFill,
  components: {
    input: ThemeStyleInput
  },
  // Blank colours are read from the photo on the server; saved ones skip that.
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value?.image) return true;
      const blank = COLOR_FIELDS.filter(({ field }) => !value[field]?.hex);
      if (!blank.length) return true;
      return `${blank.length} colour${blank.length > 1 ? 's are' : ' is'} blank, so the server reads ${blank.length > 1 ? 'them' : 'it'} from the photo. Press Generate missing to save ${blank.length > 1 ? 'them' : 'it'} now.`;
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
      name: 'image',
      type: 'cloudinary.asset',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'artist',
      type: 'reference',
      to: [{ type: 'artist' }],
      description: 'Credited in the footer while this photo is the background',
      validation: (Rule) =>
        Rule.required().warning('No artist, so the footer shows no credit.')
    },
    {
      name: 'source',
      type: 'url',
      description: 'The photo’s own page, linked when the artist has no link',
      validation: (Rule) => Rule.uri()
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
      publicId: 'image.public_id',
      artist: 'artist.name',
      url: 'image.secure_url'
    },
    // Photos keep the name they were downloaded with: photographer and photo id.
    prepare({ publicId, artist, url }) {
      return {
        title: publicId?.split('/').pop() || 'Untitled style',
        subtitle: artist,
        media: url !== undefined ? <CloudinaryPreview url={url} /> : null
      };
    }
  }
};
