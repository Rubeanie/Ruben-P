import { Fragment } from 'react';
import styles from '@/styles/components/Hero3D.module.scss';

const text = (content, style) =>
  content
    ?.find((block) => block.style === style)
    ?.children?.map((span) => span.text)
    .join('') ?? '';

// A text beat: the h2 and the first paragraph, each heading word in its own
// clip so it can rise into place (beats.js).
export default function Beat({ stage, content }) {
  const words = text(content, 'h2').split(' ');
  return (
    <div className={styles.beat} data-beat={stage}>
      <h2 className={styles.heading} data-heading>
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className={styles.clip}>
              <span className={styles.word} data-word>
                {word}
              </span>
            </span>
          </Fragment>
        ))}
      </h2>
      <p className={styles.lead} data-lead>
        {text(content, 'normal')}
      </p>
    </div>
  );
}
