import { PortableText } from '@portabletext/react';
import DynamicValue from './DynamicValue';
import styles from '@/styles/components/RichText.module.scss';

const span = (className) => {
  const Mark = ({ children }) => <span className={className}>{children}</span>;
  return Mark;
};

const components = {
  marks: {
    imgHeading: span('image-text'),
    dlig: span(styles.dlig),
    frac: span(styles.frac),
    ordn: span(styles.ordn),
    sups: span(styles.sups),
    ss01: span(styles.ss01),
    salt: span(styles.salt),
    aalt: span(styles.aalt)
  }
};

export default function RichText({ value, values }) {
  if (!value) return null;
  return (
    <PortableText
      value={value}
      components={{
        ...components,
        types: {
          ...components.types,
          dynamicValue: (props) => <DynamicValue {...props} values={values} />
        }
      }}
    />
  );
}
