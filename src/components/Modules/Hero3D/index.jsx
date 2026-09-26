import { stegaClean } from '@sanity/client/stega';
import RichText from '@/components/RichText';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import uid from '@/lib/uid';
import Beat from './Beat';
import Stage from './Stage';
import styles from '@/styles/components/Hero3D.module.scss';

export default function Hero3D(props) {
  const { content, beats, scrollHint, grain } = props;
  const id = uid(props);

  return (
    <section id={id} className={styles.section}>
      <Stage grain={grain} />
      <div className={styles.copy}>
        <div className={styles.name}>
          <RichText value={content} />
        </div>
      </div>
      <div className={styles.beats} data-beats>
        {beats?.map((beat) => (
          <Beat
            key={beat._key}
            stage={stegaClean(beat.stage)}
            content={beat.content}
          />
        ))}
      </div>
      {scrollHint && (
        <ScrollHint next={`${id}-end`} align='center' delay={1100} />
      )}
      <ScrollTarget id={`${id}-end`} />
    </section>
  );
}
