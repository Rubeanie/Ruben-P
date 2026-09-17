import { MdStar } from 'react-icons/md';

export const postFeatured = {
  name: 'post-featured',
  title: 'Featured posts',
  icon: MdStar,
  type: 'object',
  fields: [
    {
      name: 'limit',
      type: 'number',
      description:
        'Posts in the row. On a post page the row shows related posts instead.',
      initialValue: 4,
      validation: (Rule) => Rule.required().integer().min(1).max(4)
    }
  ],
  preview: {
    select: { limit: 'limit' },
    prepare({ limit }) {
      return { title: 'Featured posts', subtitle: `${limit} posts` };
    }
  }
};
