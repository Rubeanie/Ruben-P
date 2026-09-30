import { IoMdMegaphone } from 'react-icons/io';
import { getBlockText } from '@sanity/src/utils';
import { SEPARATORS } from '@/lib/announcement';
import { richBlock } from '../fragments/text-block';
import {
  SeparatorInput,
  SeparatorMedia
} from '@sanity/src/components/SeparatorInput';

// One line of 14px text inside the band's own link: no headings, lists or
// links, and no marks that need a larger size to read.
const bandBlock = {
  ...richBlock,
  styles: richBlock.styles.filter(({ value }) => value === 'normal'),
  lists: [],
  marks: {
    decorators: richBlock.marks.decorators.filter(
      ({ value }) => value !== 'imgHeading' && value !== 'code'
    ),
    annotations: []
  }
};

export const announcement = {
  name: 'announcement',
  icon: IoMdMegaphone,
  type: 'document',
  fieldsets: [{ name: 'schedule', options: { columns: 2 } }],
  fields: [
    {
      name: 'content',
      type: 'array',
      of: [bandBlock],
      validation: (Rule) => Rule.required().max(1)
    },
    {
      name: 'link',
      title: 'Link',
      type: 'link',
      description: 'Makes the whole band clickable.'
    },
    {
      name: 'marquee',
      title: 'Always scroll',
      type: 'boolean',
      initialValue: false,
      description: 'Scrolls even when the text fits.'
    },
    {
      name: 'separator',
      title: 'Separator',
      type: 'string',
      initialValue: 'dot',
      options: { list: SEPARATORS },
      components: { input: SeparatorInput }
    },
    {
      name: 'start',
      type: 'datetime',
      options: {
        dateFormat: 'DD-MM-YYYY'
      },
      fieldset: 'schedule'
    },
    {
      name: 'end',
      type: 'datetime',
      options: {
        dateFormat: 'DD-MM-YYYY'
      },
      fieldset: 'schedule'
    }
  ],
  preview: {
    select: {
      content: 'content',
      label: 'link.label',
      page: 'link.internal.title',
      separator: 'separator',
      start: 'start',
      end: 'end'
    },
    prepare({ content, label, page, separator, start, end }) {
      return {
        title: getBlockText(content),
        subtitle: [label ?? page, (start || end) && 'Scheduled']
          .filter(Boolean)
          .join(' · '),
        media: <SeparatorMedia name={separator ?? 'dot'} />
      };
    }
  }
};
