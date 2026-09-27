import { stegaClean } from '@sanity/client/stega';
import RichText from '@/components/RichText';
import CTA from '@/components/CTA';
import styles from '@/styles/components/Callout.module.scss';

export default function Callout({ content, cta, size, values }) {
  if (!content?.length && !cta?.length) return null;

  return (
    <section className={styles.callout} data-size={stegaClean(size)}>
      <div className={styles.inner}>
        {content?.length > 0 && (
          <div className={styles.content}>
            <RichText value={content} values={values} />
          </div>
        )}
        {cta?.length > 0 && (
          <div className={styles.actions}>
            {cta.map((item) => (
              <CTA key={item._key} {...item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
