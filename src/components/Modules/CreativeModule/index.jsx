import { stegaClean } from '@sanity/client/stega';
import CTA from '@/components/CTA';
import RichText from '@/components/RichText';
import ImageBlock from '@/components/RichText/ImageBlock';
import { CREATIVE_SIZES } from '@/lib/imageBlock';
import { resolveLink } from '@/lib/processUrl';
import uid from '@/lib/uid';
import { creativeIcons } from './icons';
import { ThemeCycle, ThemeImage } from '@/components/lazy';
import styles from '@/styles/components/CreativeModule.module.scss';

function Block({ block, values, sanity }) {
  const edit = sanity && { 'data-sanity': sanity };
  switch (block._type) {
    case 'icon': {
      const Glyph = creativeIcons[stegaClean(block.icon)];
      return Glyph ? (
        <Glyph
          className={styles.icon}
          strokeWidth={1.5}
          aria-hidden='true'
          {...edit}
        />
      ) : null;
    }
    case 'heading':
      return block.text ? (
        <h3 id={block.anchor} className={styles.heading} {...edit}>
          {block.text}
        </h3>
      ) : null;
    case 'copy':
      return block.content?.length ? (
        <div className={styles.text} {...edit}>
          <RichText value={block.content} values={values} />
        </div>
      ) : null;
    case 'imageBlock':
      return (
        <ImageBlock value={block} sanity={sanity} sizes={CREATIVE_SIZES} />
      );
    case 'link':
      return resolveLink(block) ? (
        <div className={styles.link} {...edit}>
          <CTA link={block} variant='link' />
        </div>
      ) : null;
    case 'themeCycle':
      return block.label ? (
        <div className={styles.control} {...edit}>
          <ThemeCycle label={block.label} />
        </div>
      ) : null;
    case 'themeImage':
      return block.label ? (
        <div className={styles.control} {...edit}>
          <ThemeImage label={block.label} />
        </div>
      ) : null;
    default:
      return null;
  }
}

export default function CreativeModule({
  columns,
  values,
  dataAttribute,
  ...props
}) {
  const filled = (columns ?? []).filter(({ blocks }) => blocks?.length);
  if (!filled.length) return null;

  return (
    <section id={uid(props)} className={styles.creative}>
      {/* Safari drops list semantics under list-style: none. */}
      <ul className={styles.grid} role='list'>
        {filled.map(({ _key, blocks }) => {
          const column = dataAttribute?.scope(`columns[_key=="${_key}"]`);
          const sanity = column?.toString();
          return (
            <li
              key={_key}
              className={styles.column}
              {...(sanity && { 'data-sanity': sanity })}>
              {blocks.map((block) => (
                <Block
                  key={block._key}
                  block={block}
                  values={values}
                  sanity={column
                    ?.scope(`blocks[_key=="${block._key}"]`)
                    .toString()}
                />
              ))}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
