import Color from 'color';
import { IoMdColorFill } from 'react-icons/io';
import { INKS } from '@/lib/posts';
import {
  ThemeColorGeneratorInput,
  ThemeStyleInput
} from '../../components/ThemeStyleInput';
import { COLOR_FIELDS } from '../../imageColors';
import { CloudinaryPreview } from '../../components/CloudinaryPreview';

// Checked only when both colours are saved.
const contrastWithBackground = (field, label, ratio) => (value) => {
  const a = value?.[field]?.hex;
  const b = value?.backgroundColor?.hex;
  if (!a || !b) return true;
  return (
    Color(a).contrast(Color(b)) >= ratio ||
    `${label} is too close to the background colour (under ${ratio}:1).`
  );
};

export const style = {
  name: 'style',
  title: 'Theme',
  type: 'object',
  icon: IoMdColorFill,
  components: {
    input: ThemeStyleInput
  },
  // Blank colours are read from the photo on the server; saved ones skip that.
  validation: (Rule) => [
    Rule.custom((value) => {
      if (!value?.image) return true;
      const blank = COLOR_FIELDS.filter(({ field }) => !value[field]?.hex);
      if (!blank.length) return true;
      return `${blank.length} colour${blank.length > 1 ? 's are' : ' is'} blank, so the server reads ${blank.length > 1 ? 'them' : 'it'} from the photo. Open Colour overrides and press Generate missing to save ${blank.length > 1 ? 'them' : 'it'} now.`;
    }).warning(),
    Rule.custom(
      contrastWithBackground('textColor', 'Text colour', 4.5)
    ).warning(),
    Rule.custom(
      contrastWithBackground('primaryColor', 'Primary colour', 3)
    ).warning()
  ],
  fieldsets: [
    {
      name: 'themeColors',
      title: 'Colour overrides',
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
      title: 'Primary colour',
      description: 'Overrides primary colour.',
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
      title: 'Secondary colour',
      description: 'Overrides secondary colour.',
      type: 'color',
      fieldset: 'themeColors',
      options: {
        disableAlpha: true
      }
    },
    {
      name: 'backgroundColor',
      title: 'Background colour',
      description: 'Overrides background colour.',
      type: 'color',
      fieldset: 'themeColors',
      options: {
        disableAlpha: true
      }
    },
    {
      name: 'textColor',
      title: 'Text colour',
      description: 'Overrides text colour.',
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
        title: publicId?.split('/').pop() || 'Untitled theme',
        subtitle: artist,
        media: url !== undefined ? <CloudinaryPreview url={url} /> : null
      };
    }
  }
};
