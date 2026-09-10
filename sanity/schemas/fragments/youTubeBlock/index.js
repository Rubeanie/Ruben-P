import { MdPlayArrow } from 'react-icons/md';
import { YouTubePreview } from './YouTubePreview';
import { blockLayoutFields } from '../fields/block-layout';

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
