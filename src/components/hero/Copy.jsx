import RichText from '@/components/RichText';
import CTA from '@/components/CTA';
import styles from '@/styles/components/HeroCopy.module.scss';

export default function Copy({ pretitle, content, ctas, className }) {
  return (
    <div className={className ? `${styles.copy} ${className}` : styles.copy}>
      {pretitle && <p className={styles.pretitle}>{pretitle}</p>}
      <RichText value={content} />
      {ctas?.length > 0 && (
        <div className={styles.ctas}>
          {ctas.map((cta) => (
            <CTA key={cta._key} link={cta.link} variant={cta.variant} />
          ))}
        </div>
      )}
    </div>
  );
}
