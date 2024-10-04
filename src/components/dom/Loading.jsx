import styles from '@/styles/components/Loading.module.scss';

export function Loading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.aspectRatioBox}>
        <svg width='0' height='0'>
          <defs>
            <clipPath id='clip-path' clipPathUnits='objectBoundingBox'>
              <path d='m.0579.2405.1601.3203-.216.4154c-.005.0098 0 .0239.0079.0239h.133c.0029 0 .0063-.0018.0079-.0055L.376.5614.1834.1798h.2835v.805c0 .008.0046.0147.01.0147h.1034c.0054 0 .01-.0067.01-.0147V0H.0579zM.6357 0v.1798h.2389L.6933.5375c-.005.0098 0 .0233.0079.0233h.1305C.835.5608.8379.5583.8396.5547l.1605-.3148V0z' />
            </clipPath>
          </defs>
        </svg>

        <svg viewBox='0 0 24 16.3' className={styles.loading}>
          <defs>
            <radialGradient
              id='highlightGradient'
              cx='20%'
              cy='0%'
              r='71.86%'
              fx='20%'
              fy='0%'
              gradientUnits='userSpaceOnUse'>
              <stop
                offset='50%'
                stopColor='rgba(255, 255, 255, 0.06)'
                stopOpacity='1'
              />
              <stop
                offset='100%'
                stopColor='rgba(150, 150, 150, 0.03)'
                stopOpacity='1'
              />
            </radialGradient>
          </defs>

          <path
            d='m1.3887 3.92 3.8416 5.22-5.1822 6.77c-.1201.16 0 .39.1901.39h3.1913c.07 0 .1501-.03.1901-.09l5.4023-7.06L4.4 2.93h6.8028v13.12c0 .13.11.24.2401.24h2.481c.1301 0 .2401-.11.2401-.24V0H1.3887zM15.2545 0v2.93h5.7324L16.635 8.76c-.1201.16 0 .38.1901.38h3.1313c.08 0 .1501-.04.1901-.1l3.8516-5.13V0z'
            fill='url(#highlightGradient)'
          />
        </svg>

        <div className={styles.clipPathDiv}></div>
      </div>
    </div>
  );
}
