import { MdEdit } from 'react-icons/md';

export const postList = {
  name: 'post-list',
  title: 'Post list',
  icon: MdEdit,
  type: 'object',
  fields: [
    {
      name: 'displayFilters',
      title: 'Display category filter buttons',
      type: 'boolean',
      initialValue: true,
      description:
        'Chips follow the Post categories order in Site Settings; a category with no posts is skipped.'
    }
  ],
  preview: {
    prepare: () => ({ title: 'Post list' })
  }
};
