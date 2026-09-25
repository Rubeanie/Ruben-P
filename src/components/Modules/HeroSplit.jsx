import uid from '@/lib/uid';
import Copy from '@/components/hero/Copy';
import Photo from '@/components/hero/Photo';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import styles from '@/styles/components/HeroSplit.module.scss';

export default function HeroSplit(props) {
  const { pretitle, content, ctas, image, scrollHint } = props;
  const id = uid(props);

  return (
    <section
      id={id}
      className={styles.hero}
      data-image-right={image?.onRight ? true : undefined}>
      <Copy
        pretitle={pretitle}
        content={content}
        ctas={ctas}
        className={styles.copy}
      />
      <Photo
        image={image}
        className={styles.frame}
        sizes='(max-width: 43.75rem) 100vw, 50vw'
        priority
      />
      {scrollHint && <ScrollHint next={`${id}-end`} align='start' />}
      {scrollHint && <ScrollTarget id={`${id}-end`} />}
    </section>
  );
}
