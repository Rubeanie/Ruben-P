export const alignmentFieldset = {
  name: 'alignment',
  options: { columns:  2 }
}

export const textAlign = {
  name: 'textAlign',
  type: 'string',
  options: {
    layout: 'radio',
    list: [ 'left', 'center', 'right' ]
  },
  initialValue: 'center',
  group: 'options'
}

export const alignItems = {
  name: 'alignItems',
  title: 'Vertical alignment',
  type: 'string',
  options: {
    layout: 'radio',
    list: [
      { title: 'Top', value: 'start' },
      'center',
      { title: 'Bottom', value: 'end' }
    ]
  },
  initialValue: 'center',
  group: 'options'
}