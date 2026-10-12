import { PortableText } from '@portabletext/react';
import { stegaClean } from '@sanity/client/stega';
import { createDataAttribute } from 'next-sanity';
import { draftMode } from 'next/headers';
import { announcementGate } from '@/lib/announcement';
import { resolveLink } from '@/lib/processUrl';
import DynamicValue from './RichText/DynamicValue';
import AnnouncementBand from './AnnouncementBand';
import AnnouncementSeparator from './AnnouncementSeparator';
import styles from '@/styles/components/Announcement.module.scss';

const span = (className) => {
  const Mark = ({ children }) => <span className={className}>{children}</span>;
  return Mark;
};

// One line inside a link: no paragraph box and no nested anchors.
const components = {
  block: { normal: ({ children }) => children },
  marks: {
    dlig: span(styles.dlig),
    ss01: span(styles.ss01)
  },
  types: { dynamicValue: DynamicValue }
};

export default async function Announcement({ announcement, logo }) {
  if (!announcement) return null;
  const id = stegaClean(announcement._id);
  const end = Date.parse(stegaClean(announcement.end)) || 0;
  const name = stegaClean(announcement.separator);
  const { isEnabled } = await draftMode();
  const sanity =
    isEnabled &&
    createDataAttribute({
      baseUrl: '/admin',
      id,
      type: 'announcement',
      // The attribute needs a field; clicking the band opens its text.
      path: 'content'
    }).toString();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: announcementGate(id, end)
        }}
      />
      <AnnouncementBand
        key={id}
        id={id}
        end={end}
        text={
          // The band is one edit target (its data-sanity); per-copy stega would
          // give every marquee copy an overlay box, off-screen ones included.
          <PortableText
            value={stegaClean(announcement.content)}
            components={components}
          />
        }
        href={resolveLink(announcement.link)}
        separator={
          name === 'none' ? null : (
            <AnnouncementSeparator name={name} logo={logo} />
          )
        }
        always={!!stegaClean(announcement.marquee)}
        {...(sanity && { sanity })}
      />
    </>
  );
}
