import { count } from "@sanity/src/utils";
import { MdLinearScale } from "react-icons/md";

export const breadcrumbs = {
  name: 'breadcrumbs',
  icon: MdLinearScale,
  type: 'object',
  fields: [
    {
      name: 'crumbs',
      type: 'array',
      of: [{ type: 'link', initialValue: { type: 'internal' } }],
      description: 'Current page is automatically added to the end of the list.'
    }
  ],
  preview: {
    select: {
      crumbs: 'crumbs'
    },
    prepare({ crumbs }) {
      return {
        title: count(crumbs, 'crumb') + ' + Current page',
        subtitle: 'Breadcrumbs'
      }
    }
  }
}