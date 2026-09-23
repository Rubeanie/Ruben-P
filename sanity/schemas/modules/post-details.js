import { MdPersonOutline } from 'react-icons/md';

const PARTS = [
  { name: 'authors', title: 'Authors' },
  { name: 'published', title: 'Publish date' },
  { name: 'edited', title: 'Last edited' },
  { name: 'categories', title: 'Categories' }
];

export const postDetails = {
  name: 'post-details',
  title: 'Post details',
  type: 'object',
  icon: MdPersonOutline,
  fields: PARTS.map(({ name, title }) => ({
    name,
    title,
    type: 'boolean',
    initialValue: true
  })),
  preview: {
    select: {
      authors: 'authors',
      published: 'published',
      edited: 'edited',
      categories: 'categories'
    },
    prepare(enabled) {
      const shown = PARTS.filter(({ name }) => enabled[name]).map(
        ({ title }) => title
      );
      return {
        title: 'Post details',
        subtitle: shown.length ? shown.join(', ') : 'Nothing shown'
      };
    }
  }
};
