import { MdStyle } from 'react-icons/md';

export const theme = {
  name: 'theme',
  type: 'document',
  icon: MdStyle,
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'styles',
      type: 'array',
      of: [{ type: 'styleType' }]
    }
  ],
};
