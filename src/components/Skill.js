import styles from '@/styles/components/Skill.module.scss';

export default function Skill({ heading = "heading", logo, color = styles.colorPrimary, textColor = "#121212" }) {
  return (
    <div className={styles.skill} style={{ background: color }}>
      <div className='column'>
        <div className={styles.svgWrapper} style={{ color: textColor }}>
          {logo}
        </div>
        <div className={styles.textWrapper}>
          <p style={{ color: textColor }}>
            <b>{heading}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
