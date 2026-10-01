// Fixed lookup rather than parsing the string: the schema offers these four and
// an unknown value should not reach CSS.
export const ASPECTS = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '21:9': '21 / 9'
};

export const aspectOf = (value) => ASPECTS[value] || ASPECTS['16:9'];
