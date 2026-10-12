import { MdLink, MdLooksOne } from 'react-icons/md';

const montBase = {
  fontFamily: 'var(--font-mont), sans-serif'
};

const DligDecorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontVariantLigatures: 'discretionary-ligatures'
    }}>
    {children}
  </span>
);

const Ss01Decorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontFeatureSettings: '"ss01" 1'
    }}>
    {children}
  </span>
);

export const otDecorators = [
  {
    title: 'Discretionary Ligatures',
    value: 'dlig',
    icon: MdLink,
    component: DligDecorator
  },
  {
    title: 'Stylistic Set 1',
    value: 'ss01',
    icon: MdLooksOne,
    component: Ss01Decorator
  }
];
