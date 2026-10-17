import { IoMdPricetag } from 'react-icons/io';
import { apiVersion } from '@/lib/env';
import { categorySlug } from '@/lib/posts';

export const postCategory = {
  name: 'post.category',
  title: 'Post category',
  type: 'document',
  icon: IoMdPricetag,
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: (Rule) => [
        Rule.required(),
        // The URL and the filter chip use the slug, so two titles can't share one.
        Rule.custom(async (title, { document, getClient }) => {
          const slug = categorySlug(title);
          if (!slug) return true;
          const id = document._id.replace(/^drafts\./, '');
          const titles = await getClient({ apiVersion }).fetch(
            `*[_type == 'post.category' && !(_id in [$id, $draft])].title`,
            { id, draft: `drafts.${id}` }
          );
          const clash = titles.find((other) => categorySlug(other) === slug);
          return clash
            ? `“${clash}” has the same URL slug (${slug}), so the category filter would show one of them.`
            : true;
        }).warning()
      ]
    },
    {
      name: 'color',
      type: 'color',
      options: { disableAlpha: true },
      description:
        'Tints the category’s filter chip, its dot on post tiles and its capsule on the post page'
    }
  ],
  preview: {
    select: { title: 'title', color: 'color.hex' },
    prepare: ({ title, color }) => ({
      title,
      media: (
        <span
          className='category-swatch'
          style={{ background: color || 'transparent' }}
        />
      )
    })
  }
};
