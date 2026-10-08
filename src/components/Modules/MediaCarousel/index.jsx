import { stegaClean } from '@sanity/client/stega';
import { MediaCarousel as Carousel } from '@/components/lazy';
import { aspectOf } from '@/components/Modules/ThreeScene/aspects';
import { captionText } from '@/components/RichText/FigureCaption';
import { blockLayout } from '@/components/RichText/layout';
import { resolveImage, scenePoster } from '@/lib/imageBlock';
import { isAnimated } from '@/lib/imageLoader';
import { renderable } from '@/lib/carouselItems';
import uid from '@/lib/uid';
import {
  getThumb,
  getTitle,
  getYouTubeId,
  getYouTubeStart
} from '@/lib/youtube';
import styles from '@/styles/components/MediaCarousel.module.scss';

// A renderable item as the client island draws it.
async function resolve(item) {
  const common = {
    key: item._key,
    caption: captionText({ caption: item.caption, source: item.source })
  };
  switch (stegaClean(item._type)) {
    case 'carouselImage': {
      const { src, still, clip, position, placeholder } = resolveImage(
        item.image
      );
      return {
        ...common,
        type: 'image',
        src,
        still,
        clip,
        position,
        placeholder,
        alt: stegaClean(item.alt),
        // A clip that plays as video rests on its first frame, nothing to warm.
        animated: isAnimated(src) && !clip?.video
      };
    }
    case 'carouselYouTube': {
      const url = stegaClean(item.url);
      const id = getYouTubeId(url);
      const [title, thumb] = await Promise.all([getTitle(id), getThumb(id)]);
      const start = getYouTubeStart(url);
      return { ...common, type: 'youtube', id, start, title, thumb };
    }
    case 'carouselScene':
      return {
        ...common,
        type: 'scene',
        model: stegaClean(item.model),
        poster: scenePoster(item.poster),
        modelBytes: item.modelBytes,
        label: stegaClean(item.alt),
        // The three.js module's options, as it passes them to its scene.
        look: {
          background: stegaClean(item.background?.hex),
          lights: stegaClean(item.lights?.hex),
          environmentSource: stegaClean(item.environmentSource),
          environmentPreset: stegaClean(item.environmentPreset),
          environment: stegaClean(item.environment),
          environmentBackground: item.environmentBackground,
          keyLight: item.keyLight,
          bloom: stegaClean(item.bloom),
          grain: stegaClean(item.grain),
          vignette: stegaClean(item.vignette),
          orbitControls: item.orbitControls,
          zoom: item.zoom
        }
      };
  }
}

// Server component: resolves each item's media, and the video titles and
// posters, then hands the stack to the client island.
export default async function MediaCarousel(props) {
  const items = await Promise.all(
    (props.items ?? []).filter(renderable).map(resolve)
  );
  if (!items.length) return null;

  // Streams in after the page's pre-paint reveal script has run, so this
  // wrapper, already in place, is what the script holds for the entrance.
  return (
    <div className={styles.column} data-entrance data-reveal-skip>
      <Carousel
        id={uid(props)}
        layout={blockLayout(stegaClean(props.size), stegaClean(props.align))}
        items={items}
        aspect={aspectOf(stegaClean(props.aspectRatio))}
        loop={props.loop}
        preload={props.lead}
        besideRail={props.besideRail}
      />
    </div>
  );
}
