import styles from '@/styles/components/Skill.module.scss';

export default function Skill({
  heading,
  logo,
  color = 'var(--color-primary)'
}) {
  return (
    <div className={styles.skill} style={{ '--brand': color }}>
      {logo && (
        <span className={styles.watermark} aria-hidden='true'>
          {logo}
        </span>
      )}
      <span className={styles.label}>{heading}</span>
    </div>
  );
}
