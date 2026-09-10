'use client';

import { Children, useState } from 'react';
import styles from '@/styles/components/Breadcrumbs.module.scss';

// Takes the rendered crumb items so the server component keeps the JSON-LD and
// the link resolution; this half only owns the collapse state.
export default function Trail({ children }) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);

  if (items.length <= 3) return <ol className={styles.list}>{items}</ol>;

  // The button stays in place and toggles, so focus never sits on a node that
  // disappears and aria-expanded always matches what is on screen.
  const more = (
    <li key='more' className={styles.item}>
      <button
        type='button'
        className={styles.more}
        aria-label='Show hidden pages'
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}>
        <span aria-hidden='true'>…</span>
      </button>
    </li>
  );

  return (
    <ol className={styles.list}>
      {[items[0], more, ...items.slice(expanded ? 1 : -2)]}
    </ol>
  );
}
