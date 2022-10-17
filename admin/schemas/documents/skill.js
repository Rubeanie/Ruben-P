import React from 'react'

export default {
  name: 'skill',
  title: 'Skills',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Skill Name',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Logo',
      type: 'image',
    },
    {
      title: 'Text Color',
      name: 'textColor',
      type: 'color',
    },
    {
      title: 'Base Color',
      name: 'baseColor',
      type: 'color',
    },
    {
      title: 'External URL',
      name: 'url',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ['https', 'http', 'mailto', 'tel'],
        }),
    },
  ],
  preview: {
    select: {
      title: 'name',
      color: 'baseColor.hex',
      url: 'image.asset.url',
    },
    prepare(selection) {
      const { title, color, url } = selection
      return {
        title: title,

        // `media` takes a function, string or React element
        // Remember to import React from 'react' if you are rendering React components like below
        media: (
          <img src={url} style={{ backgroundColor: `${color}` }}>
          </img>
        ),
      }
    },
  },
}
