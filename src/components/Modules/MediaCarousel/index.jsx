import { stegaClean } from '@sanity/client/stega';
import { MediaCarousel as Carousel } from '@/components/lazy';
import { captionText } from '@/components/RichText/FigureCaption';
import { resolveAsset } from '@/lib/imageBlock';
import { isGif } from '@/lib/imageLoader';
import { renderable } from '@/lib/carouselItems';
import uid from '@/lib/uid';
import {
  getThumb,
  getTitle,
  getYouTubeId,
  getYouTubeStart
} from '@/lib/youtube';

// Fixed lookup rather than parsing the string: an unknown value should not reach CSS.
const ASPECTS = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4'
};

// A renderable item as the client island draws it.
async function resolve(item) {
  const common = {
    key: item._key,
    caption: captionText({ caption: item.caption, source: item.source })
  };
  switch (stegaClean(item._type)) {
    case 'carouselImage': {
      const { src } = resolveAsset(item);
      return {
        ...common,
        type: 'image',
        src,
        alt: stegaClean(item.alt),
        animated: isGif(src)
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
        poster: stegaClean(item.poster),
        modelBytes: item.modelBytes,
        label: stegaClean(item.alt)
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
    <div data-entrance data-reveal-skip>
      <Carousel
        id={uid(props)}
        items={items}
        aspect={ASPECTS[stegaClean(props.aspectRatio)] || ASPECTS['16:9']}
        loop={props.loop}
        preload={props.isFirstModule}
        besideRail={props.besideRail}
      />
    </div>
  );
}
