import { PortableText } from '@portabletext/react';
import { stegaClean } from '@sanity/client/stega';
import { isSafeHref } from '@/lib/processUrl';
import DynamicValue from './DynamicValue';
import ImageBlock from './ImageBlock';
import YouTube from './YouTube';
import Code from './Code';
import styles from '@/styles/components/RichText.module.scss';

const span = (className) => {
  const Mark = ({ children }) => <span className={className}>{children}</span>;
  return Mark;
};

// The Studio's url rule stops bad schemes at entry; this holds on the site too.
const Link = ({ value, children }) => {
  const href = stegaClean(value?.href);
  return href && isSafeHref(href) ? <a href={href}>{children}</a> : children;
};

// Ids come from the page's anchors pass, so they are unique across modules.
const heading = (Tag, size) => {
  const Heading = ({ value, children }) => (
    <Tag id={value.anchor} data-size={size}>
      {children}
    </Tag>
  );
  return Heading;
};

const components = {
  block: {
    h1: heading('h1'),
    h1Large: heading('h1', 'large'),
    h2: heading('h2'),
    h3: heading('h3')
  },
  marks: {
    link: Link,
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

export default function RichText({
  value,
  values,
  dataAttribute,
  isFirstModule
}) {
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
            <YouTube
              {...props}
              sanity={blockPath(dataAttribute, props)}
              priority={isFirstModule && props.index === 0}
            />
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
