import styles from '@/styles/components/TableOfContents.module.scss';

// Wide screens: the outline in the prose margin, with a progress line that
// fills as you read and only the current section open. useSpy drives it.
export default function Rail({
  groups,
  active,
  current,
  shown,
  navRef,
  trackRef,
  markRef
}) {
  const link = (entry) => (
    <a
      href={`#${entry.id}`}
      data-level={entry.level}
      aria-current={entry.id === active ? 'location' : undefined}>
      <span>{entry.text}</span>
    </a>
  );

  return (
    <aside className={styles.margin}>
      <nav
        ref={navRef}
        className={styles.rail}
        data-hidden={!shown || undefined}
        inert={!shown || undefined}
        aria-label='On this page'>
        <p className={styles.label}>On this page</p>
        <div className={styles.track} ref={trackRef}>
          <span ref={markRef} className={styles.mark} aria-hidden='true' />
          <ol className={styles.list}>
            {groups.map((group) => {
              const open = group.id === current?.id;
              return (
                <li key={group.id}>
                  {link(group)}
                  {group.children.length > 0 && (
                    <div
                      className={styles.sub}
                      data-sub
                      data-open={open || undefined}
                      inert={!open || undefined}>
                      <ol>
                        {group.children.map((child) => (
                          <li key={child.id}>{link(child)}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </aside>
  );
}
