import { PortableText } from '@portabletext/react';
import DynamicValue from './DynamicValue';
import ImageBlock from './ImageBlock';
import YouTube from './YouTube';
import Code from './Code';
import styles from '@/styles/components/RichText.module.scss';

const span = (className) => {
  const Mark = ({ children }) => <span className={className}>{children}</span>;
  return Mark;
};

const components = {
  marks: {
    imgHeading: span('image-text'),
    dlig: span(styles.dlig),
    ss01: span(styles.ss01)
  },
  types: {
    imageBlock: ImageBlock,
    youtube: YouTube,
    code: Code
  }
};

// Presentation tool only: each block gets the path the Studio opens it from; production markup is untouched.
const blockPath = (dataAttribute, props) =>
  dataAttribute
    ? dataAttribute.scope(`[_key=="${props.value._key}"]`).toString()
    : undefined;

export default function RichText({ value, values, dataAttribute }) {
  if (!value) return null;
  return (
    <PortableText
      value={value}
      components={{
        ...components,
        types: {
          ...components.types,
          imageBlock: (props) => (
            <ImageBlock {...props} sanity={blockPath(dataAttribute, props)} />
          ),
          youtube: (props) => (
            <YouTube {...props} sanity={blockPath(dataAttribute, props)} />
          ),
          code: (props) => (
            <Code {...props} sanity={blockPath(dataAttribute, props)} />
          ),
          dynamicValue: (props) => <DynamicValue {...props} values={values} />
        }
      }}
    />
  );
}
