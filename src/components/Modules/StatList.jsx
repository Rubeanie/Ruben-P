import { stegaClean } from '@sanity/client/stega';
import CountUp from '@/components/CountUp';
import styles from '@/styles/components/StatList.module.scss';

export default function StatList({ stats, textAlign, dataAttribute }) {
  // Absent Sanity arrays project as null, bypassing the `= []` param default.
  const visibleStats = (stats ?? []).filter(
    ({ value, subValue, text }) => value || subValue || text
  );
  const align = stegaClean(textAlign);

  if (visibleStats.length === 0) return null;

  return (
    <section
      className={styles.statList}
      data-align={align === 'center' ? undefined : align}>
      <div className={styles.stats} data-count-row>
        {visibleStats.map(({ _key, value, subValue, text }) => {
          const sanity = dataAttribute
            ?.scope(`stats[_key=="${_key}"]`)
            .toString();
          return (
            <div
              className={styles.stat}
              key={_key}
              {...(sanity && { 'data-sanity': sanity })}>
              {(value || subValue) && (
                <p className={styles.value}>
                  <CountUp value={stegaClean(value)} label={value} />
                  {subValue && (
                    <span className={styles.subValue}>{subValue}</span>
                  )}
                </p>
              )}
              {text && <p className={styles.text}>{text}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
