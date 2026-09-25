import { themeFromImage } from '@/lib/imageTheme';
import { coverSizes } from '@/lib/coverSizes';
import uid from '@/lib/uid';
import GatedPhoto from '@/components/hero/GatedPhoto';
import ScrollHint, { ScrollTarget } from '@/components/hero/ScrollHint';
import ThemeHandoff from '@/components/hero/ThemeHandoff';
import Lines from './Lines';
import styles from '@/styles/components/HeroGlass.module.scss';

// The settle starts the photo this much larger.
const ZOOM = 1.12;

// Type straight on the module's own photo, which lends the site its theme and
// hands it back as the page scrolls.
export default async function HeroGlass(props) {
  const { pretitle, content, ctas, image, scrollHint } = props;
  const id = uid(props);
  const url = image?.asset?.url;
  const colors = url ? await themeFromImage(url) : null;
  const ratio = image?.asset?.metadata?.dimensions?.aspectRatio;

  return (
    <ThemeHandoff
      id={id}
      className={styles.hero}
      colors={colors}
      end='60lvh'
      line={70}>
      <div className={styles.frame} data-gate={url ? true : undefined}>
        <GatedPhoto
          image={image}
          className={styles.photo}
          sizes={coverSizes(ratio, 100, 100, ZOOM)}
          priority
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
