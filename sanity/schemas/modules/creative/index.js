import { textBlock } from "@sanity/schemas/fragments/text-block";
import { creativeCtas } from "./creativeCtas";
import { creativeIcon } from "./creativeIcon";
import { creativeImage } from "./creativeImage";
import { creativeRichtext } from "./creativeRichtext";
import { textAlign, alignItems, alignmentFieldset } from "@sanity/schemas/fragments/fields/alignment";
import { count, getBlockText } from "@sanity/src/utils";
import { MdExtension } from 'react-icons/md';

export const creativeModule = {
  name: 'creative-module',
  title: 'Creative module',
  icon: MdExtension,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fieldsets: [alignmentFieldset],
  fields: [
    {
      name: 'intro',
      ...textBlock,
      group: 'content'
    },
    {
      name: 'modules',
      type: 'object',
      fields: [
        {
          name: 'subModules',
          type: 'array',
          of: [
            creativeCtas,
            creativeIcon,
            creativeImage,
            creativeRichtext,
            { type: 'custom-html' }
          ]
        },
        {
          name: 'colSpan',
          title: 'Column span',
          type: 'number',
          validation: (Rule) => Rule.min(1).integer()
        }
      ],
      preview: {
        select: {
          subModules: 'subModules',
          colSpan: 'colspan'
        },
        prepare({ subModules, colSpan }) {
          return {
            title: subModules
              .map((subModule) => subModule._type)
              .filter(Boolean)
              .join(' + '),
            subtitle: colSpan > 1 ? `${colSpan}-column span` : undefined
          };
        }
      },
      group: 'content'
    },
    {
      name: 'columns',
      type: 'number',
      description: 'Leave empty to use the number of modules as columns',
      validation: (Rule) => Rule.min(1).integer(),
      group: 'options'
    },
    {
      name: 'bordered',
      type: 'boolean',
      description:
        'When enabled, vertical alignment will be set to "stretched"',
      initialValue: false,
      group: 'options'
    },
    {
      ...textAlign,
      fieldset: 'alignment'
    },
    {
      ...alignItems,
      fieldset: 'alignment',
      hidden: ({ parent }) => parent.bordered
    }
  ],
  preview: {
    select: {
      intro: 'intro',
      modules: 'modules'
    },
    prepare({ intro, modules }) {
      return {
        title: getBlockText(intro),
        subtitle: count(modules, 'module')
      }
    }
  }
};