import {
  MdLink,
  MdAutoAwesome,
  MdFormatListNumbered,
  MdSuperscript,
  MdLooksOne,
  MdSwapHoriz,
  MdHorizontalRule
} from 'react-icons/md';

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

const FracDecorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontVariantNumeric: 'diagonal-fractions'
    }}>
    {children}
  </span>
);

const OrdnDecorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontVariantNumeric: 'ordinal'
    }}>
    {children}
  </span>
);

const SupsDecorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontVariantPosition: 'super'
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

const SaltDecorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontFeatureSettings: '"salt" 1'
    }}>
    {children}
  </span>
);

const AaltDecorator = ({ children }) => (
  <span
    style={{
      ...montBase,
      fontFeatureSettings: '"aalt" 1'
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
    title: 'Fractions',
    value: 'frac',
    icon: MdHorizontalRule,
    component: FracDecorator
  },
  {
    title: 'Ordinals',
    value: 'ordn',
    icon: MdFormatListNumbered,
    component: OrdnDecorator
  },
  {
    title: 'Superscript',
    value: 'sups',
    icon: MdSuperscript,
    component: SupsDecorator
  },
  {
    title: 'Stylistic Set 1',
    value: 'ss01',
    icon: MdLooksOne,
    component: Ss01Decorator
  },
  {
    title: 'Stylistic Alternates',
    value: 'salt',
    icon: MdSwapHoriz,
    component: SaltDecorator
  },
  {
    title: 'All Alternates',
    value: 'aalt',
    icon: MdAutoAwesome,
    component: AaltDecorator
  }
];
