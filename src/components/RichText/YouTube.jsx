import { stegaClean } from '@sanity/client/stega';
import {
  embedSrc,
  getThumb,
  getTitle,
  getYouTubeId,
  getYouTubeStart,
  IFRAME_ALLOW
} from '@/lib/youtube';
import { YouTubeFacade } from '@/components/lazy';
import FigureCaption from './FigureCaption';
import { blockLayout } from './layout';
import styles from '@/styles/components/RichText.module.scss';

export default async function YouTube({ value, sanity, lead = false }) {
  const url = stegaClean(value?.url);
  const id = getYouTubeId(url);
  if (!id) return null;

  const controls = stegaClean(value?.controls) !== false;
  const start = getYouTubeStart(url);
  const [title, thumb] = await Promise.all([getTitle(id), getThumb(id)]);
  const size = stegaClean(value?.size);
  const align = stegaClean(value?.align);

  const player = stegaClean(value?.autoplay) ? (
    <div className={styles.video}>
      <iframe
        src={embedSrc(id, { controls, start, autoplay: true, mute: true })}
        title={title}
        loading='lazy'
        allow={IFRAME_ALLOW}
        allowFullScreen
        referrerPolicy='strict-origin-when-cross-origin'
        data-loaded=''
      />
    </div>
  ) : (
    <YouTubeFacade
      key={`${id}:${start}`}
      id={id}
      title={title}
      thumb={thumb}
      controls={controls}
      start={start}
      size={size}
      framed
      {...(lead && { loading: 'eager', fetchPriority: 'high' })}
    />
  );

  // The caption sits outside the clipped 16:9 box, like an image's.
  return (
    <figure
      className={styles.videoFigure}
      {...blockLayout(size, align)}
      {...(sanity && { 'data-sanity': sanity })}>
      {player}
      <FigureCaption caption={value?.caption} source={value?.source} />
    </figure>
  );
}
