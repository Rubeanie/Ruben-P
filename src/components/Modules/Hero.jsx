import { themeFromImage } from '@/lib/imageTheme';
import { heroPhotos } from '@/lib/heroPhotos';
import uid from '@/lib/uid';
import Copy from '@/components/hero/Copy';
import Photo from '@/components/hero/Photo';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import ThemeHandoff from '@/components/hero/ThemeHandoff';
import styles from '@/styles/components/Hero.module.scss';

// The photo fills the hero and the site takes its theme, then it shrinks into
// a card and hands the theme back as the page scrolls.
export default async function Hero(props) {
  const { pretitle, content, ctas, bgImageAlt, scrollHint } = props;
  const id = uid(props);
  const photos = heroPhotos(props);
  // The colours come from the still, a clip's Start frame.
  const url = photos[0]?.image.still;
  const colors = url ? await themeFromImage(url) : null;

  return (
    // The section runs 112lvh; the flip sits halfway through the 28lvh settle.
    <ThemeHandoff
      id={id}
      className={styles.hero}
      colors={colors}
      end='28lvh'
      line={98}>
      <div className={styles.stick}>
        {/* Eager at high priority. A lone photo also gets React's automatic
            preload; a pair relies on these two alone. */}
        <Photo
          photos={photos}
          alt={bgImageAlt}
          className={styles.photo}
          loading='eager'
          fetchPriority='high'
        />
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
