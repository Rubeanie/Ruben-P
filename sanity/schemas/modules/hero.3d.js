import { Md3dRotation } from 'react-icons/md';
import { getBlockText } from '@sanity/src/utils';
import { textBlock } from '../fragments/text-block';
import { scrollHintField } from '../fragments/fields/scroll-hint';

export const hero3d = {
  name: 'hero.3d',
  title: 'Hero (3D)',
  icon: Md3dRotation,
  type: 'object',
  fields: [
    {
      name: 'content',
      ...textBlock,
      description: 'The name and the line under it'
    },
    {
      name: 'beats',
      title: 'Text beats',
      type: 'array',
      of: [
        {
          name: 'beat',
          type: 'object',
          fields: [
            {
              name: 'stage',
              type: 'string',
              options: {
                layout: 'radio',
                list: [
                  { title: 'Turn', value: 'turn' },
                  { title: 'Approach', value: 'approach' }
                ]
              },
              validation: (Rule) => Rule.required()
            },
            {
              name: 'content',
              ...textBlock,
              description: 'A heading and one paragraph'
            }
          ],
          preview: {
            select: {
              stage: 'stage',
              content: 'content'
            },
            prepare: ({ stage, content }) => ({
              title: getBlockText(content),
              subtitle: stage
            })
          }
        }
      ],
      validation: (Rule) =>
        Rule.max(2).custom((beats) => {
          const stages = (beats ?? []).map((beat) => beat.stage);
          return stages.length === new Set(stages).size
            ? true
            : 'Only one beat per stage';
        }),
      description: 'One for the turn, one for the approach'
    },
    scrollHintField({ initialValue: false })
  ],
  preview: {
    select: {
      content: 'content'
    },
    prepare: ({ content }) => ({
      title: getBlockText(content),
      subtitle: 'Hero (3D)'
    })
  }
};
