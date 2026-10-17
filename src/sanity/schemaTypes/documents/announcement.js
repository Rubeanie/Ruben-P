import { IoMdMegaphone } from 'react-icons/io';
import { getBlockText } from '@/sanity/utils';
import { apiVersion } from '@/lib/env';
import { SEPARATORS } from '@/lib/announcement';
import { richBlock } from '../fragments/text-block';
import { link } from '../objects/link';
import {
  SeparatorInput,
  SeparatorMedia
} from '@/sanity/components/SeparatorInput';

// One line of 14px text inside the band's own link: no headings, lists or
// links, and no marks that need a larger size to read.
const bandBlock = {
  ...richBlock,
  of: [],
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
  validation: (Rule) =>
    Rule.custom(async (doc, { getClient }) => {
      const listed = await getClient({ apiVersion }).fetch(
        `count(*[_type == 'site' && $id in announcements[]._ref])`,
        { id: doc._id.replace(/^drafts\./, '') }
      );
      return listed > 0
        ? true
        : 'Not in Site settings > Announcements, so it never shows.';
    }).warning(),
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
      ...Object.fromEntries(
        Object.entries(link.preview.select).map(([key, path]) => [
          key,
          `link.${path}`
        ])
      ),
      separator: 'separator',
      start: 'start',
      end: 'end'
    },
    prepare({ content, separator, start, end, ...target }) {
      return {
        title: getBlockText(content),
        subtitle: [
          link.preview.prepare(target).title,
          (start || end) && 'Scheduled'
        ]
          .filter(Boolean)
          .join(' · '),
        media: <SeparatorMedia name={separator ?? 'dot'} />
      };
    }
  }
};
