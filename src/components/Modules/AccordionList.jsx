import RichText from '@/components/RichText';
import uid from '@/lib/uid';
import { stegaClean } from '@sanity/client/stega';
import styles from '@/styles/components/AccordionList.module.scss';

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'>
      <path d='m6 9 6 6 6-6' />
    </svg>
  );
}

export default function AccordionList({
  items,
  layout,
  multiple,
  dataAttribute,
  ...props
}) {
  // Absent Sanity arrays project as null, bypassing the `= []` param default.
  // An item without a question is not a row: the summary is its only control.
  const visibleItems = (items ?? []).filter((item) => item.summary);
  // A single row cannot be split across two columns.
  const horizontal =
    stegaClean(layout) === 'horizontal' && visibleItems.length > 1;
  const half = Math.ceil(visibleItems.length / 2);
  // Fixed columns, filled top to bottom: opening a row must not move the other side.
  const columns = horizontal
    ? [visibleItems.slice(0, half), visibleItems.slice(half)]
    : [visibleItems];

  const id = uid(props);
  // One open row per module unless the editor allows several: details that
  // share a name close each other natively.
  const group = multiple ? undefined : `accordion-${id}`;

  if (visibleItems.length === 0) return null;

  return (
    <section id={id} className={styles.accordionList}>
      <div className={`${styles.plate} ${horizontal ? styles.horizontal : ''}`}>
        {columns.map((column, index) => (
          <div className={styles.column} key={index}>
            {column.map((item) => {
              const path = `items[_key=="${item._key}"]`;
              const sanity = dataAttribute?.scope(path).toString();
              return (
                <details
                  key={item._key}
                  className={styles.item}
                  name={group}
                  open={item.open}
                  {...(sanity && { 'data-sanity': sanity })}>
                  <summary className={styles.summary}>
                    {/* A heading per question lets screen readers jump through the list. */}
                    <h3 className={styles.question}>
                      <span>{item.summary}</span>
                      <Chevron />
                    </h3>
                  </summary>
                  {item.content?.length > 0 && (
                    <div className={styles.answer}>
                      <RichText
                        value={item.content}
                        dataAttribute={dataAttribute?.scope(`${path}.content`)}
                      />
                    </div>
                  )}
                </details>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
