import { MdSmartButton } from "react-icons/md";
import { getBlockText } from "@sanity/src/utils";
import { textBlock } from "../fragments/text-block";

export const callout = {
  name: 'callout',
  icon: MdSmartButton,
  type: 'object',
  fields: [
    {
      name: 'content',
      ...textBlock
    },
    {
      name: 'cta',
      title: 'Call-to-action',
      type: 'array',
      of: [{ type: 'cta' }]
    }
  ],
  preview: {
    select: {
      content: 'content'
    },
    prepare({ content }) {
      return {
        title: getBlockText(content),
        subtitle: 'Callout'
      }
    }
  }
}