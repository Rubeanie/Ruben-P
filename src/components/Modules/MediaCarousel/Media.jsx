'use client';

import { useState } from 'react';
import { preload } from 'react-dom';
import { getImageProps } from 'next/image';
import Image from '@/components/CdnImage';
import ClipVideo from '@/components/ClipVideo';
import SceneCanvas, {
  warmScene
} from '@/components/Modules/ThreeScene/SceneCanvas';
import YouTubeFacade from '@/components/RichText/YouTubeFacade';
import { clipWidth } from '@/lib/imageBlock';
import { loaderFor } from '@/lib/imageLoader';
import { warmEmbed } from '@/lib/youtube';
import styles from '@/styles/components/MediaCarousel.module.scss';

// Fetches, at low priority, what a card needs the moment it comes to the
// front: an animation's full rendition (at the widths the front card picks
// from), the embed's connections, or the scene's code and model.
export function warmMedia(item, sizes) {
  if (item.type === 'image' && item.animated) {
    const { props } = getImageProps({
      src: item.src,
      alt: '',
      fill: true,
      sizes,
      loader: loaderFor(item.src, item.clip)
    });
    preload(props.src, {
      as: 'image',
      imageSrcSet: props.srcSet,
      imageSizes: sizes,
      fetchPriority: 'low'
    });
  } else if (item.type === 'youtube') {
    warmEmbed();
  } else if (item.type === 'scene') {
    warmScene();
    // The same request three's loader makes, so it is served from the cache.
    preload(item.model, {
      as: 'fetch',
      crossOrigin: 'anonymous',
      fetchPriority: 'low'
    });
  }
}

// Counts the times this card lost the carousel's one player or scene to
// another, so a key can drop the old instance.
function useResets(live) {
  const [resets, setResets] = useState(0);
  const [wasLive, setWasLive] = useState(live);
  if (live !== wasLive) {
    setWasLive(live);
    if (!live) setResets(resets + 1);
  }
  return resets;
}

// `load` is 'preload' for the page's opening card, 'eager' for the cards
// visible behind it, so none of them waits on lazy loading.
const loadProps = (load) => ({
  loading: load ? 'eager' : undefined,
  fetchPriority: load === 'preload' ? 'high' : undefined
});

// An animated image rests on its first frame until its card is in front; a
// clip that plays as video always shows that frame, and plays over it in front.
function Photo({ item, active, load, sizes }) {
  const video = item.clip?.video;
  return (
    <>
      <Image
        src={video || (item.animated && !active) ? item.still : item.src}
        clip={item.clip}
        alt={item.alt || ''}
        fill
        sizes={sizes}
        {...loadProps(load)}
        placeholder={item.placeholder}
        // Cropped to the card's ratio around the subject; inline, as next/image
        // frames the placeholder by the same style.
        style={{ objectFit: 'cover', objectPosition: item.position }}
        draggable={false}
        className={styles.fill}
      />
      {video && active && (
        <ClipVideo
          src={item.src}
          clip={item.clip}
          width={clipWidth(sizes)}
          className={styles.fill}
          // Framed like the still under it, so the subject holds as it plays.
          style={{ objectPosition: item.position }}
        />
      )}
    </>
  );
}

// Paused, not unmounted, while away; losing the player to another card drops it.
function YouTube({ item, active, near, live, load, sizes, onPlay }) {
  const resets = useResets(live);
  return (
    <YouTubeFacade
      key={resets}
      id={item.id}
      title={item.title}
      thumb={item.thumb}
      start={item.start}
      sizes={sizes}
      {...loadProps(load)}
      className={styles.embed}
      inCarousel
      paused={!active}
      prebuild={near}
      onPlay={onPlay}
    />
  );
}

// The scene brings its own facade and loader; losing the carousel's one live
// scene to another card resets it to the poster, always a still.
function Scene({ item, active, live, onPlay, blockSize }) {
  const resets = useResets(live);
  // A lost context can't show its last frame, so the card goes back to its poster.
  const [lost, setLost] = useState(0);
  return (
    <div
      className={styles.fill}
      // Takes focus from the load button when the scene replaces it.
      tabIndex={-1}
      onClickCapture={(event) => {
        if (!live && event.target.closest('button')) onPlay();
      }}>
      <SceneCanvas
        key={`${resets}:${lost}`}
        {...item.look}
        model={item.model}
        poster={item.poster}
        blockSize={blockSize}
        modelBytes={item.modelBytes}
        label={item.label}
        paused={!active}
        onLost={() => setLost(lost + 1)}
        loadOnClick
      />
    </div>
  );
}

const RENDERERS = { image: Photo, youtube: YouTube, scene: Scene };

export default function Media(props) {
  const Renderer = RENDERERS[props.item.type];
  return <Renderer {...props} />;
}
