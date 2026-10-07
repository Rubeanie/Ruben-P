import { MdPlayArrow } from 'react-icons/md';
import { YouTubePreview } from './YouTubePreview';
import { blockLayoutFields } from '../fields/block-layout';
import { imageBlock } from '../image-block';

// The image block's caption and source, moved into this block's content group.
const reuse = (name) => {
  const { fieldset, ...field } = imageBlock.fields.find((f) => f.name === name);
  return { ...field, group: 'content' };
};

export const youTubeBlock = {
  name: 'youtube',
  type: 'object',
  title: 'YouTube',
  icon: MdPlayArrow,
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'url',
      type: 'url',
      title: 'URL',
      placeholder: 'https://youtu.be/<video_id>',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https']
        }),
      group: 'content'
    },
    reuse('caption'),
    reuse('source'),
    {
      name: 'autoplay',
      type: 'boolean',
      initialValue: false,
      group: 'options'
    },
    {
      name: 'controls',
      type: 'boolean',
      initialValue: true,
      group: 'options'
    },
    ...blockLayoutFields({ group: 'options' })
  ],
  preview: {
    select: {
      title: 'url'
    }
  },
  components: {
    preview: YouTubePreview
  }
};
