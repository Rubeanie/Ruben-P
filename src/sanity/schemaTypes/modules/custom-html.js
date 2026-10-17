import { MdCode } from 'react-icons/md';
import { uidField } from '../fragments/fields/uid';

export const customHtml = {
  name: 'custom-html',
  title: 'Custom HTML',
  icon: MdCode,
  type: 'object',
  fields: [
    uidField(),
    {
      name: 'html',
      title: 'HTML',
      type: 'code',
      options: {
        language: 'html',
        languageAlternatives: [{ title: 'HTML', value: 'html' }]
      }
    }
  ],
  preview: {
    select: {
      title: 'html.code'
    },
    prepare: ({ title }) => ({
      title,
      subtitle: 'Custom HTML'
    })
  }
};
