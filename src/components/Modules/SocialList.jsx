import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import Social from '@/components/Social';
import { resolveLink } from '@/lib/processUrl';
import uid from '@/lib/uid';
import { sanitizeLogo } from '@/lib/cachedLogo';
import styles from '@/styles/components/Social.module.scss';

export default async function SocialList({
  socials = [],
  maxColumns = 2,
  ...props
}) {
  // a reference still being picked in the Studio dereferences to null
  const items = socials?.filter(Boolean) ?? [];
  const logos = await Promise.all(
    items.map(({ logo }) => logo && sanitizeLogo(stegaClean(logo)))
  );

  return (
    <section id={uid(props)} className={styles.socials}>
      {items.length > 0 && (
        <div
          className={styles.list}
          style={{ '--max-cols': maxColumns }}
          data-reveal-children='items'>
          {items.map(({ _id, title, username, baseColor, redirect }, i) => {
            // Internal destinations link direct; external ones go through the vanity path
            // (the query leaves `external` out on purpose).
            const href =
              resolveLink(redirect?.destination) ??
              stegaClean(redirect?.source);
            const card = (
              <Social
                heading={title}
                subheading={username}
                logo={
                  logos[i] && (
                    <span dangerouslySetInnerHTML={{ __html: logos[i] }} />
                  )
                }
                color={stegaClean(baseColor?.hex)}
              />
            );

            return href ? (
              <Link href={href} className={styles.card} key={_id}>
                {card}
              </Link>
            ) : (
              <div className={styles.card} key={_id}>
                {card}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
