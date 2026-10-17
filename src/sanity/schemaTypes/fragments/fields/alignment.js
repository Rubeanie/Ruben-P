export const textAlign = {
  name: 'textAlign',
  type: 'string',
  options: {
    layout: 'radio',
    list: [
      { title: 'Left', value: 'left' },
      { title: 'Centre', value: 'center' },
      { title: 'Right', value: 'right' }
    ]
  },
  initialValue: 'center',
  group: 'options'
};
