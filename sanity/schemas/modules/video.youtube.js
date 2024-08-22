import { MdVideoSettings } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';

export const videoYouTube = {
  name: 'video.youtube',
  title: 'YouTube video',
  icon: MdVideoSettings,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    {
      name: 'intro',
      ...textBlock,
      group: 'content'
    },
    {
      name: 'url',
      type: 'url',
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
    }
  ],
  preview: {
    select: {
      intro: 'intro'
    },
    prepare: ({ intro }) => ({
      title: getBlockText(intro),
      subtitle: 'YouTube video'
    })
  }
};
