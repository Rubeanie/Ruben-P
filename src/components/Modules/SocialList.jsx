import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import Social from '@/components/Social';
import { resolveLink } from '@/lib/processUrl';
import { sanitizeSvg } from '@/lib/sanitizeSvg';
import styles from '@/styles/components/Social.module.scss';

export default function SocialList({ socials = [], maxColumns = 2 }) {
  return (
    <section>
      {socials?.length > 0 && (
        <div className={styles.list} style={{ '--max-cols': maxColumns }}>
          {/* a reference still being picked in the Studio dereferences to null */}
          {socials
            .filter(Boolean)
            .map(({ _id, title, username, logo, baseColor, redirect }) => {
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
                    logo && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: sanitizeSvg(stegaClean(logo))
                        }}
                      />
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
