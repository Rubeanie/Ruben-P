import Link from 'next/link';
import { stegaClean } from '@sanity/client/stega';
import Skill from '@/components/Skill';
import { resolveLink } from '@/lib/processUrl';
import uid from '@/lib/uid';
import { sanitizeLogo } from '@/lib/cachedLogo';
import styles from '@/styles/components/Skill.module.scss';

export default async function SkillList({ skills, ...props }) {
  if (!skills?.length) return null;
  const logos = await Promise.all(
    skills.map(({ logo }) => logo && sanitizeLogo(stegaClean(logo)))
  );

  return (
    <section
      id={uid(props)}
      className={styles.list}
      data-reveal-children='items'>
      {skills.map(({ _key, title, baseColor, url }, i) => {
        const href = resolveLink(url);
        // Skill sites open in a new tab; an internal page stays in this one.
        const external = stegaClean(url?.type) === 'external';
        const card = (
          <Skill
            heading={title}
            logo={
              logos[i] && (
                <span dangerouslySetInnerHTML={{ __html: logos[i] }} />
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
            {external && (
              <span className={styles.srOnly}>, opens in a new tab</span>
            )}
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
