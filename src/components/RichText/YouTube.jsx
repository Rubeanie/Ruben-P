import { stegaClean } from '@sanity/client/stega';
import {
  embedSrc,
  getYouTubeId,
  getYouTubeStart,
  IFRAME_ALLOW
} from '@/lib/youtube';
import YouTubeFacade from './YouTubeFacade';
import { blockLayout } from './layout';
import styles from '@/styles/components/RichText.module.scss';

// oEmbed gives the real title for the facade's caption and aria-label.
async function getTitle(id) {
  const fallback = 'YouTube video';
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { next: { revalidate: 86400 } }
    );
    if (!response.ok) return fallback;
    const data = await response.json();
    return data.title || fallback;
  } catch {
    return fallback;
  }
}

// YouTube only renders the 1280px poster for some videos; the rest answer 404, so ask first.
async function getThumb(id) {
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  try {
    const response = await fetch(maxres, {
      method: 'HEAD',
      next: { revalidate: 86400 }
    });
    if (response.ok) return maxres;
  } catch {
    // fall through to the poster every video has
  }
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export default async function YouTube({ value, sanity }) {
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
      id={id}
      title={title}
      thumb={thumb}
      controls={controls}
      start={start}
      size={size}
      align={align}
      sanity={sanity}
    />
  );
}
