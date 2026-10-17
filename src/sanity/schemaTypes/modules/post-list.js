import { MdEdit } from 'react-icons/md';
import { uidField } from '../fragments/fields/uid';

export const postList = {
  name: 'post-list',
  title: 'Post list',
  icon: MdEdit,
  type: 'object',
  fields: [
    {
      name: 'displayFilters',
      title: 'Show search and filters',
      type: 'boolean',
      initialValue: true,
      description:
        'The search field, category chips and feed link above the tiles. Chips follow the Post categories order in Site settings; a category with no posts is skipped.'
    },
    uidField()
  ],
  preview: {
    prepare: () => ({ title: 'Post list' })
  }
};
