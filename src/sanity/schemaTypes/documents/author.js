import { MdPerson } from 'react-icons/md';
import { assetPreview } from '../../components/CloudinaryPreview';
import { uniqueName } from '../fragments/unique-name';

export const author = {
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: MdPerson,
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: uniqueName
    },
    {
      name: 'photo',
      type: 'cloudinaryImage',
      description: 'Square crop works best'
    },
    {
      name: 'link',
      type: 'link',
      description: 'Where the name and photo lead'
    },
    {
      name: 'jobTitle',
      type: 'string',
      description: 'Shown to search engines, e.g. Web developer'
    }
  ],
  preview: {
    select: { title: 'name', asset: 'photo.asset' },
    prepare: ({ title, asset }) => ({
      title,
      media: assetPreview(asset)
    })
  }
};
