import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import Skill from '@/components/Skill';
import { resolveLink } from '@/lib/processUrl';
import { sanitizeSvg } from '@/lib/sanitizeSvg';
import styles from '@/styles/components/Skill.module.scss';

export default function SkillList({ skills }) {
  if (!skills?.length) return null;

  return (
    <section className={styles.list}>
      {skills.map(({ _key, title, logo, baseColor, url }) => {
        const href = resolveLink(url);
        // Skill sites open in a new tab; an internal page stays in this one.
        const external = stegaClean(url?.type) === 'external';
        const card = (
          <Skill
            heading={title}
            logo={
              logo && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: sanitizeSvg(stegaClean(logo))
                  }}
                />
              )
            }
            color={stegaClean(baseColor?.hex) ?? undefined}
          />
        );

        return href ? (
          <Link
            href={href}
            className={styles.card}
            key={_key}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
            {card}
          </Link>
        ) : (
          <div className={styles.card} key={_key}>
            {card}
          </div>
        );
      })}
    </section>
  );
}
