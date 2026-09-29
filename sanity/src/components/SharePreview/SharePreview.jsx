'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Lato, Noto_Sans } from 'next/font/google';
import { Card, Stack, Tab, TabList, TabPanel, Text } from '@sanity/ui';
import styles from '@/styles/components/SharePreview.module.scss';
import { PLATFORMS, limitLine, statusOf } from './platforms';
import { Legend, REPLICAS } from './Replicas';

// Stand-ins for gg sans and Slack-Lato, which only ship inside those clients.
const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans',
  preload: false
});
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-lato',
  preload: false
});

export default function SharePreview({ preview }) {
  const [tab, setTab] = useState('google');
  const id = useId();
  const row = useRef(null);
  const Replica = REPLICAS[tab];
  // Keeps the selected tab in view when the row scrolls sideways on a narrow pane.
  useEffect(() => {
    const box = row.current;
    const el = box?.querySelector('[aria-selected="true"]');
    if (!el) return;
    const left = el.offsetLeft - box.offsetLeft;
    if (
      left < box.scrollLeft ||
      left + el.offsetWidth > box.scrollLeft + box.clientWidth
    )
      box.scrollLeft = left - (box.clientWidth - el.offsetWidth) / 2;
  }, [tab]);
  const statuses = Object.fromEntries(
    PLATFORMS.map((p) => [p.id, statusOf(p.id, preview)])
  );
  if (preview.template)
    return (
      <Text size={1} muted>
        Template page: never shared at its own address.
      </Text>
    );
  return (
    <Stack space={3} className={`${notoSans.variable} ${lato.variable}`}>
      <div className={styles.tabs} ref={row}>
        <TabList space={1}>
          {PLATFORMS.map((p) => (
            <Tab
              key={p.id}
              id={`${id}-tab-${p.id}`}
              aria-controls={`${id}-panel`}
              title={statuses[p.id][0] ?? 'Nothing to fix'}
              label={
                <span className={styles.tabLabel}>
                  <span
                    className={styles.dot}
                    aria-hidden='true'
                    data-warn={statuses[p.id].length > 0 || undefined}
                  />
                  {p.name}
                  <span className={styles.srOnly}>
                    {statuses[p.id].length
                      ? `, ${statuses[p.id].length} to fix`
                      : ', nothing to fix'}
                  </span>
                </span>
              }
              selected={tab === p.id}
              onClick={() => setTab(p.id)}
            />
          ))}
        </TabList>
      </div>
      <TabPanel id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
        <Stack space={3} paddingTop={2}>
          <Replica d={preview} />
          {statuses[tab].length > 0 && (
            <Card padding={2} radius={2} tone='caution' border>
              <Stack space={2}>
                {statuses[tab].map((s) => (
                  <Text key={s} size={1}>
                    {s}
                  </Text>
                ))}
              </Stack>
            </Card>
          )}
          <Text size={1} muted>
            {limitLine(tab, preview)}
          </Text>
          {preview.generated && (
            <Text size={1} muted>
              {preview.generated === 'published'
                ? 'The generated card shows the published page.'
                : 'Generated card appears after publishing.'}
            </Text>
          )}
          <Legend />
        </Stack>
      </TabPanel>
    </Stack>
  );
}
