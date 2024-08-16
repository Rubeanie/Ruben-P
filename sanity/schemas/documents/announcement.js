import { IoMdMegaphone, IoMdCalendar } from "react-icons/io";
import { getBlockText } from '@sanity/src/utils'
import { textBlock } from "../fragments/text-block";

export const announcement = {
  name: 'announcement',
  icon: IoMdMegaphone,
  type: 'document',
  fieldsets: [{ name: 'schedule', options: { columns: 2 } }],
  fields: [
    {
      name: 'content',
      ...textBlock
    },
    {
      name: 'cta',
      title: 'Call-to-action',
      type: 'link'
    },
    {
      name: 'start',
      type: 'datetime',
      fieldset: 'schedule'
    },
    {
      name: 'end',
      type: 'datetime',
      fieldset: 'schedule'
    }
  ],
  preview: {
    select: {
      content: 'content',
      cta: 'cta.label',
      start: 'start',
      end: 'end'
    },
    prepare({ content, cta, start, end }) {
      return {
        title: getBlockText(content),
        subtitle: cta,
        media: (start || end) && IoMdCalendar
      }
    }
  }
}