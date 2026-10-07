'use client';

import { useState } from 'react';
import { preload } from 'react-dom';
import { getImageProps } from 'next/image';
import Image from '@/components/CdnImage';
import SceneCanvas, {
  warmScene
} from '@/components/Modules/ThreeScene/SceneCanvas';
import YouTubeFacade from '@/components/RichText/YouTubeFacade';
import { isAnimated, loaderFor, stillFrame } from '@/lib/imageLoader';
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
      loader: loaderFor(item.src)
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
  preload: load === 'preload',
  loading: load === 'eager' ? 'eager' : undefined
});

// An animated image rests on its first frame until its card is in front.
function Photo({ item, active, load, sizes }) {
  return (
    <Image
      src={item.animated && !active ? stillFrame(item.src) : item.src}
      alt={item.alt || ''}
      fill
      sizes={sizes}
      {...loadProps(load)}
      draggable={false}
      className={styles.fill}
    />
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
// scene to another card resets it to the poster, which rests on its first frame
// away from the front like a Photo.
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
        poster={
          isAnimated(item.poster) && !active
            ? stillFrame(item.poster)
            : item.poster
        }
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
