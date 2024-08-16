import { IoMdMegaphone, IoMdCalendar } from "react-icons/io";
import { getBlockText } from '@sanity/src/utils'

export const announcement = {
  name: 'announcement',
  icon: IoMdMegaphone,
  type: 'document',
  fieldsets: [{ name: 'schedule', options: { columns: 2 } }],
  fields: [
    {
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }]
        }
      ]
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
    perpare({ content, cta, start, end }) {
      return {
        title: getBlockText(content),
        subtitle: cta,
        media: (start || end) && IoMdCalendar
      }
    }
  }
}