// Size and alignment for blocks that can sit narrower than the measure; `container` is the host's fieldset or group.
export const blockLayoutFields = (container) => [
  {
    name: 'size',
    type: 'string',
    options: {
      list: [
        { title: 'Full width', value: 'full' },
        { title: 'Medium (three quarters)', value: 'medium' },
        { title: 'Small (half)', value: 'small' }
      ],
      layout: 'radio'
    },
    initialValue: 'full',
    ...container
  },
  {
    name: 'align',
    type: 'string',
    options: {
      list: [
        { title: 'Start', value: 'start' },
        { title: 'Centre', value: 'center' },
        { title: 'End', value: 'end' }
      ],
      layout: 'radio'
    },
    initialValue: 'center',
    // A full-width image has nothing to align against.
    hidden: ({ parent }) => (parent?.size ?? 'full') === 'full',
    ...container
  }
];
