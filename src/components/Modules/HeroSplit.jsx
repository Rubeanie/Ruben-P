import { heroPhotos } from '@/lib/heroPhotos';
import uid from '@/lib/uid';
import Copy from '@/components/hero/Copy';
import Photo from '@/components/hero/Photo';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import styles from '@/styles/components/HeroSplit.module.scss';

export default function HeroSplit(props) {
  const { pretitle, content, ctas, image, scrollHint } = props;
  const id = uid(props);
  const [photo] = heroPhotos(props);

  return (
    <section
      id={id}
      className={styles.hero}
      data-reveal-skip
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
        sizes={photo.sizes}
        preload
      />
      {scrollHint && <ScrollHint next={`${id}-end`} align='start' />}
      {scrollHint && <ScrollTarget id={`${id}-end`} />}
    </section>
  );
}
