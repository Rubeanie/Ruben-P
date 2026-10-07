import { themeFromImage } from '@/lib/imageTheme';
import { heroPhotos } from '@/lib/heroPhotos';
import uid from '@/lib/uid';
import GatedPhoto from '@/components/hero/GatedPhoto';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import ThemeHandoff from '@/components/hero/ThemeHandoff';
import Lines from './Lines';
import styles from '@/styles/components/HeroGlass.module.scss';

// Type straight on the module's own photo, which lends the site its theme and
// hands it back as the page scrolls.
export default async function HeroGlass(props) {
  const { pretitle, content, ctas, imageAlt, scrollHint } = props;
  const id = uid(props);
  const photos = heroPhotos(props);
  // The colours come from the still, a clip's Start frame.
  const url = photos[0]?.image.still;
  const colors = url ? await themeFromImage(url) : null;

  return (
    <ThemeHandoff
      id={id}
      className={styles.hero}
      colors={colors}
      end='60lvh'
      line={70}>
      <div className={styles.frame} data-gate={url ? true : undefined}>
        <GatedPhoto
          photos={photos}
          alt={imageAlt}
          className={styles.photo}
          preload
        />
        <Lines
          pretitle={pretitle}
          content={content}
          ctas={ctas}
          className={styles.copy}
        />
        {scrollHint && (
          <ScrollHint next={`${id}-end`} align='start' delay={1850} />
        )}
      </div>
      <ScrollTarget id={`${id}-end`} />
    </ThemeHandoff>
  );
}
