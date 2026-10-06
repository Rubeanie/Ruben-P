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
import { blockLayout } from './layout';
import styles from '@/styles/components/RichText.module.scss';

export default async function YouTube({ value, sanity, preload = false }) {
  const url = stegaClean(value?.url);
  const id = getYouTubeId(url);
  if (!id) return null;

  const controls = stegaClean(value?.controls) !== false;
  const start = getYouTubeStart(url);
  const [title, thumb] = await Promise.all([getTitle(id), getThumb(id)]);
  const size = stegaClean(value?.size);
  const align = stegaClean(value?.align);

  if (stegaClean(value?.autoplay))
    return (
      <div
        className={styles.video}
        {...blockLayout(size, align)}
        {...(sanity && { 'data-sanity': sanity })}>
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
    );

  return (
    <YouTubeFacade
      key={`${id}:${start}`}
      id={id}
      title={title}
      thumb={thumb}
      controls={controls}
      start={start}
      size={size}
      align={align}
      sanity={sanity}
      preload={preload}
    />
  );
}
