'use client';

import { useRef } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { groupsOf } from '@/lib/toc';
import Rail from './Rail';
import { useSpy } from './useSpy';
import accordion from '@/styles/components/AccordionList.module.scss';
import styles from '@/styles/components/TableOfContents.module.scss';

export default function Outline({ id, entries }) {
  const block = useRef(null);
  const nav = useRef(null);
  const track = useRef(null);
  const mark = useRef(null);
  const { active, shown } = useSpy(entries, { block, nav, track, mark });
  const groups = groupsOf(entries);
  // Null until the reader reaches the first heading.
  const current = groups.find(
    (group) =>
      group.id === active || group.children.some((child) => child.id === active)
  );

  const link = (entry) => (
    <a
      href={`#${entry.id}`}
      data-level={entry.level}
      aria-current={entry.id === active ? 'location' : undefined}>
      {entry.text}
    </a>
  );

  return (
    <div id={id} ref={block} className={styles.toc}>
      {/* Closed while you read, so it shows the whole outline and never changes
          shape; only the current mark follows the page. */}
      <div className={`${accordion.plate} ${styles.phone}`}>
        <details className={`${accordion.item} ${styles.details}`}>
          <summary className={`${accordion.summary} ${styles.summary}`}>
            On this page
            <LuChevronDown strokeWidth={1.75} aria-hidden='true' />
          </summary>
          <nav aria-label='On this page'>
            <ol className={styles.outline}>
              {groups.map((group) => (
                <li key={group.id}>
                  {link(group)}
                  {group.children.length > 0 && (
                    <ol>
                      {group.children.map((child) => (
                        <li key={child.id}>{link(child)}</li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </details>
      </div>
      <Rail
        groups={groups}
        active={active}
        current={current}
        shown={shown}
        navRef={nav}
        trackRef={track}
        markRef={mark}
      />
    </div>
  );
}
