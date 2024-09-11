import styles from '@/styles/components/Social.module.scss';

export default function Social({ heading = "heading", subheading = "subheading", logo, color = styles.colorPrimary, textColor = "#121212" }) {
  return (
    <div className={styles.social} style={{ background: color }}>
      <div className='row'>
        <div className={styles.svgWrapper} style={{ color: textColor }}>
          {logo}
        </div>
        <div className={styles.textWrapper}>
          <p style={{ color: textColor }}>
            <b>
              {heading}
              <br />
              {subheading}
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}
