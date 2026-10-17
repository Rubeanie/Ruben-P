import { PortableText, toPlainText } from '@portabletext/react';
import { stegaClean } from '@sanity/client/stega';
import NextLink from 'next/link';
import { isInternalHref, resolveLink } from '@/lib/processUrl';
import DynamicValue from './DynamicValue';
import ImageBlock from './ImageBlock';
import YouTube from './YouTube';
import Code from './Code';
import HeadingLink from './HeadingLink';
import styles from '@/styles/components/RichText.module.scss';

const span = (className) => {
  const Mark = ({ children }) => <span className={className}>{children}</span>;
  return Mark;
};

// Resolves like a CTA, scheme check included.
const Link = ({ value, children }) => {
  const href = resolveLink(value);
  if (!href) return children;
  // Internal paths get Next's prefetch and a client navigation instead of a reload.
  const Anchor = isInternalHref(href) ? NextLink : 'a';
  return <Anchor href={href}>{children}</Anchor>;
};

// Ids come from the page's anchors pass, so they are unique across modules.
const heading = (Tag) => {
  const Heading = ({ value, children }) => (
    <Tag
      id={value.anchor}
      className={value.anchorLink ? styles.linked : undefined}>
      {children}
      {value.anchorLink && (
        <HeadingLink id={value.anchor} label={stegaClean(toPlainText(value))} />
      )}
    </Tag>
  );
  return Heading;
};

const components = {
  block: {
    h1: heading('h1'),
    h2: heading('h2'),
    h3: heading('h3')
  },
  marks: {
    linkMark: Link,
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

export default function RichText({ value, values, dataAttribute, lead }) {
  if (!value) return null;
  // The lead module's first image or video (see leadModule).
  // Matched by key: PortableText's indices count a list as one block.
  const firstKey = lead
    ? value.find(({ _type }) => _type === 'imageBlock' || _type === 'youtube')
        ?._key
    : undefined;
  return (
    <PortableText
      value={value}
      components={{
        ...components,
        types: {
          ...components.types,
          imageBlock: (props) => (
            <ImageBlock
              {...props}
              sanity={blockPath(dataAttribute, props)}
              lead={!!firstKey && props.value._key === firstKey}
            />
          ),
          youtube: (props) => (
            <YouTube
              {...props}
              sanity={blockPath(dataAttribute, props)}
              lead={!!firstKey && props.value._key === firstKey}
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
