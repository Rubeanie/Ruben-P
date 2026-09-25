import RichText from '@/components/RichText';
import CTA from '@/components/CTA';
import Copy from '@/components/hero/Copy';
import copyStyles from '@/styles/components/HeroCopy.module.scss';
import styles from '@/styles/components/HeroGlass.module.scss';

// The heading splits at its soft breaks, each line rising from its own clip.
export default function Lines({ pretitle, content, ctas, className }) {
  const heading = content?.find((block) => block.style === 'h1');
  if (!heading)
    return (
      <Copy
        pretitle={pretitle}
        content={content}
        ctas={ctas}
        className={className}
      />
    );

  const lines = (heading.children ?? [])
    .map((child) => child.text ?? '')
    .join('')
    .split('\n');
  const rest = content.filter((block) => block !== heading);

  return (
    <div className={`${copyStyles.copy} ${className}`}>
      {pretitle && <p className={copyStyles.pretitle}>{pretitle}</p>}
      <h1 className={styles.lines}>
        {lines.map((line, i) => (
          <span key={i} className={styles.line}>
            <span style={{ '--i': i }}>{line}</span>
          </span>
        ))}
      </h1>
      {rest.length > 0 && (
        <div className={`${styles.lead} ${styles.leadIn}`}>
          <RichText value={rest} />
        </div>
      )}
      {ctas?.length > 0 && (
        <div className={`${copyStyles.ctas} ${styles.leadIn}`}>
          {ctas.map((cta) => (
            <CTA key={cta._key} link={cta.link} variant={cta.variant} />
          ))}
        </div>
      )}
    </div>
  );
}
