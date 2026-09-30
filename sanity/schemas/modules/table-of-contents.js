import { MdToc } from 'react-icons/md';
import { uidField } from '../fragments/fields/uid';

export const tableOfContents = {
  name: 'table-of-contents',
  title: 'Table of contents',
  icon: MdToc,
  type: 'object',
  description:
    'Lists the headings below it. Wide screens show it beside the text.',
  fields: [uidField()],
  preview: {
    prepare: () => ({
      title: 'Table of contents',
      subtitle: 'Headings below this block'
    })
  }
};
