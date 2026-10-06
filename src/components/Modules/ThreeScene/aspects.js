// Fixed lookup rather than parsing the string: an unknown value should not
// reach CSS. Shared by the 3D module and the carousel, which adds 3:4.
export const ASPECTS = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4',
  '21:9': '21 / 9'
};

export const aspectOf = (value) => ASPECTS[value] || ASPECTS['16:9'];
