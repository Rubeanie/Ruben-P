'use client';

import { useRef, useState } from 'react';
import { animated } from '@react-spring/web';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { carouselSizes, depthOf } from '@/lib/carousel';
import { behind, stepFrom } from './loop';
import { saveData } from '@/lib/saveData';
import useReducedMotion from '@/lib/useReducedMotion';
import Media, { warmMedia } from './Media';
import StackTrack from './StackTrack';
import useEntrance from './entrance';
import styles from '@/styles/components/MediaCarousel.module.scss';

// Where you are, not a control: the live region says it in words.
function Dots({ count, index }) {
  return (
    <span className={styles.dots} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={styles.dot}
          data-active={i === index || undefined}
        />
      ))}
    </span>
  );
}

export default function Carousel({
  id,
  items,
  aspect,
  loop,
  preload,
  besideRail
}) {
  const [index, setIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  // The cards holding the carousel's one YouTube player and one live scene.
  const [live, setLive] = useState({});
  const count = items.length;
  const wraps = loop && count > 1;
  // The front card's share of the row; the stack takes the rest.
  const { room, deepest } = depthOf(count, wraps);
  const sizes = carouselSizes(count, loop, besideRail);
  const front = useRef(index);
  front.current = index;
  const entrance = useEntrance({
    count,
    loop: wraps,
    deepest,
    index: front
  });

  // A card's media mounts once it comes within reach of the front card, or of
  // a card a drag passes: the drawn stack and one more either way, one either
  // side under reduced motion. It stays mounted after, so nothing reloads.
  const reduced = useReducedMotion();
  const inReach = (at) =>
    items.flatMap((_, i) => {
      const d = behind(i, at, count, wraps);
      return d >= -1 && d <= (reduced ? 1 : deepest + 1) ? [i] : [];
    });
  const [reached, setReached] = useState(() => new Set(inReach(index)));
  const reach = (at) =>
    setReached((had) => {
      const fresh = inReach(at).filter((i) => !had.has(i));
      return fresh.length ? new Set([...had, ...fresh]) : had;
    });
  if (inReach(index).some((i) => !reached.has(i))) reach(index);

  // Opening the page, the front card is its largest paint and the cards
  // behind it are on screen too.
  const loadFor = (i) => {
    if (!preload) return undefined;
    if (i === 0) return 'preload';
    const d = behind(i, 0, count, wraps);
    return d > 0 && d <= deepest ? 'eager' : undefined;
  };

  // Warms the card at i ahead of its arrival; every warm-up dedupes itself.
  const warm = (i) => {
    if (items[i] && !saveData()) warmMedia(items[i], sizes);
  };

  // Buttons and keys announce the slide; a swipe or a tap on a card is its own feedback.
  const step = (by) => {
    const next = stepFrom(index, by, count, wraps);
    if (next === null) return;
    setIndex(next);
    setAnnouncement(`Slide ${next + 1} of ${count}`);
  };

  const onKeyDown = (event) => {
    const by = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!by) return;
    event.preventDefault();
    // Holding an arrow steps once, so the live region isn't flooded.
    if (!event.repeat) step(by);
  };

  const renderSlide = (item, i, active) => (
    <div
      className={styles.slide}
      role='group'
      aria-roledescription='slide'
      aria-label={`${i + 1} of ${count}`}
      inert={!active}>
      {reached.has(i) ? (
        <Media
          item={item}
          active={active}
          // The cards an arrow would bring forward.
          near={[-1, 0, 1].some(
            (by) => stepFrom(index, by, count, wraps) === i
          )}
          load={loadFor(i)}
          sizes={sizes}
          live={live[item.type] === item.key}
          onPlay={() => setLive((held) => ({ ...held, [item.type]: item.key }))}
        />
      ) : null}
    </div>
  );

  const button = (by) => {
    const first = by < 0;
    const Icon = first ? LuChevronLeft : LuChevronRight;
    // Reaching for an arrow warms the card it would bring forward.
    const intent = () => warm(stepFrom(index, by, count, wraps));
    return (
      <button
        type='button'
        className={styles.button}
        aria-label={first ? 'Previous slide' : 'Next slide'}
        aria-disabled={stepFrom(index, by, count, wraps) === null}
        onPointerEnter={intent}
        onPointerDown={intent}
        onFocus={intent}
        onClick={() => step(by)}>
        <Icon aria-hidden />
      </button>
    );
  };

  // Every caption sits in one cell, so the row is as tall as the longest and
  // never changes height between slides; only the current one shows.
  const hasCaptions = items.some((item) => item.caption);

  return (
    <section
      ref={entrance.ref}
      id={id}
      className={styles.carousel}
      aria-roledescription='carousel'
      aria-label='Media'
      style={{ '--aspect': aspect, '--room': room, '--count': count }}
      onKeyDown={onKeyDown}>
      <StackTrack
        items={items}
        index={index}
        onIndex={setIndex}
        onWarm={warm}
        onReach={reach}
        loop={wraps}
        renderSlide={renderSlide}
        entrance={entrance}
      />
      {count > 1 && (
        <animated.div
          className={styles.bar}
          style={{
            opacity: entrance.bar.o,
            transform: entrance.bar.y.to((y) =>
              y ? `translateY(${y}px)` : 'none'
            )
          }}>
          {hasCaptions && (
            <div className={styles.captions}>
              {items.map((item, i) => (
                <p
                  key={item.key}
                  className={styles.caption}
                  data-current={i === index || undefined}
                  aria-hidden={i !== index || undefined}>
                  {item.caption}
                </p>
              ))}
            </div>
          )}
          <div className={styles.controls}>
            {button(-1)}
            <Dots count={count} index={index} />
            {button(1)}
          </div>
        </animated.div>
      )}
      <p className={styles.srOnly} aria-live='polite' aria-atomic='true'>
        {announcement}
      </p>
    </section>
  );
}
