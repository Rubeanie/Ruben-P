import { heroPhotos } from '@/lib/heroPhotos';
import uid from '@/lib/uid';
import Copy from '@/components/hero/Copy';
import Photo from '@/components/hero/Photo';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import styles from '@/styles/components/HeroSplit.module.scss';

export default function HeroSplit(props) {
  const { pretitle, content, ctas, imageAlt, imageOnRight, scrollHint } = props;
  const id = uid(props);

  return (
    <section
      id={id}
      className={styles.hero}
      data-reveal-skip
      data-image-right={imageOnRight ? true : undefined}>
      <Copy
        pretitle={pretitle}
        content={content}
        ctas={ctas}
        className={styles.copy}
      />
      <Photo
        photos={heroPhotos(props)}
        alt={imageAlt}
        className={styles.frame}
        preload
      />
      {scrollHint && <ScrollHint next={`${id}-end`} align='start' />}
      {scrollHint && <ScrollTarget id={`${id}-end`} />}
    </section>
  );
}
