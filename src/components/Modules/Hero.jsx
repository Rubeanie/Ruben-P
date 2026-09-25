import { themeFromImage } from '@/lib/imageTheme';
import { coverSizes } from '@/lib/coverSizes';
import uid from '@/lib/uid';
import Copy from '@/components/hero/Copy';
import Photo from '@/components/hero/Photo';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import ThemeHandoff from '@/components/hero/ThemeHandoff';
import styles from '@/styles/components/Hero.module.scss';

const ratio = (image) => image?.asset?.metadata?.dimensions?.aspectRatio;

// The photo fills the hero and the site takes its theme, then it shrinks into
// a card and hands the theme back as the page scrolls.
export default async function Hero(props) {
  const { pretitle, content, ctas, bgImage, bgImageMobile, scrollHint } = props;
  const id = uid(props);
  const url = bgImage?.asset?.url;
  const colors = url ? await themeFromImage(url) : null;
  const mobile = bgImageMobile?.asset?.url;
  // The hidden photo of the pair only fetches a 1px rendition.
  const both = url && mobile;

  return (
    // The section runs 112lvh; the flip sits halfway through the 28lvh settle.
    <ThemeHandoff
      id={id}
      className={styles.hero}
      colors={colors}
      end='28lvh'
      line={98}>
      <div className={styles.stick}>
        <Photo
          image={bgImage}
          className={styles.photo}
          sizes={`${both ? '(max-width: 43.75rem) 1px, ' : ''}${coverSizes(ratio(bgImage), 100)}`}
          priority
        />
        {mobile && (
          <Photo
            image={bgImageMobile}
            className={styles.photoMobile}
            sizes={`${both ? '(min-width: 43.75rem) 1px, ' : ''}${coverSizes(ratio(bgImageMobile), 100)}`}
            priority
          />
        )}
        <Copy
          pretitle={pretitle}
          content={content}
          ctas={ctas}
          className={styles.copy}
        />
        {scrollHint && (
          <ScrollHint next={`${id}-end`} align='start' delay={1100} />
        )}
      </div>
      <ScrollTarget id={`${id}-end`} />
    </ThemeHandoff>
  );
}
