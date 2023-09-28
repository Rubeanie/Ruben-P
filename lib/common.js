import { AgeFromDate } from 'age-calculator';

function Age() {
  return new AgeFromDate(new Date('2004-07-26')).age;
}

export { Age };
