import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  animatesTile,
  denseLayout,
  liveFrames,
  photoFrames,
  photoShrinks
} from '@/lib/bento';
import { easeOut, iosWebKit, reducedMotion } from '@/lib/posts';
import styles from '@/styles/components/PostList.module.scss';

// A filter re-settles the whole bento, so the browser morphs each named tile
// to its new cell instead of snapping. flushSync lands the store update inside
// the callback, where the transition expects the DOM to change.
//
// `select(params)` is the result selection and `fill(result, params)` the page
// fill the render uses, so the capture prediction plans from the same inputs;
// `onCommit(q)` tells the owner which query its own commit wrote.
export default function useBentoMorph({
  list,
  grid,
  select,
  fill,
  onCommit,
  updateSearch
}) {
  // Only the height release's exact scroll destination is exempt.
  const ownScroll = useRef(null);
  const transition = useRef(null);
  const pending = useRef(null);
  // Up while a morph runs: tiles hold their image candidate list until it ends, so a source swap never lands inside it.
  const [morphing, setMorphing] = useState(false);
  // The settle-down in flight, so the next morph can cut it short at the height it has reached.
  const settling = useRef(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    // Back drops what was queued behind a running morph; unmount stops it committing to the next page.
    const drop = () => (pending.current = null);
    window.addEventListener('popstate', drop);
    return () => {
      window.removeEventListener('popstate', drop);
      alive.current = false;
      settling.current?.();
    };
  }, []);
  const hold = (section) => {
    const height = section.offsetHeight;
    settling.current?.();
    // A surviving tile must not become a scroll anchor as it changes cells:
    // capture prediction and both snapshots share the same viewport origin.
    section.style.overflowAnchor = 'none';
    section.style.minBlockSize = `${height}px`;
  };
  // A shorter page has no transform equivalent, so the hold eases down to the new height instead of snapping at the end of the morph.
  const release = (section) => {
    const held = parseFloat(section.style.minBlockSize);
    section.style.minBlockSize = '';
    const natural = section.offsetHeight;
    // Measuring the natural height can itself clamp the document scroll.
    const measured = scrollY;
    ownScroll.current = () => measured;
    if (natural >= held) {
      section.style.overflowAnchor = '';
      return;
    }
    section.style.minBlockSize = `${held}px`;
    section.dataset.settling = '';
    // Resolved at the held height first, so the change below is a transition and not a jump.
    void section.offsetHeight;
    // The scroll only clamps once the slack below the fold is gone, so the shrink is mirrored onto the scroll to keep the tiles on the same curve.
    const startY = scrollY;
    const endY = Math.max(
      0,
      Math.min(
        startY,
        document.documentElement.scrollHeight - (held - natural) - innerHeight
      )
    );
    // CSS height changes can clamp scroll before the next mirror frame runs.
    // Compare to the release's current curve, not its previous scrollTo call.
    const curveY = () =>
      startY -
      ((startY - endY) * (held - section.offsetHeight)) / (held - natural);
    ownScroll.current = curveY;
    let frame = 0;
    const mirror = () => {
      scrollTo({
        top: curveY(),
        behavior: 'instant'
      });
      frame = requestAnimationFrame(mirror);
    };
    if (endY < startY) frame = requestAnimationFrame(mirror);
    section.style.minBlockSize = `${natural}px`;
    const done = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      section.removeEventListener('transitionend', onEnd);
      delete section.dataset.settling;
      section.style.minBlockSize = '';
      section.style.overflowAnchor = '';
      const settled = scrollY;
      ownScroll.current = () => settled;
      settling.current = null;
    };
    const onEnd = (event) => {
      if (
        event.target === section &&
        /^min-(block-size|height)$/.test(event.propertyName)
      )
        done();
    };
    section.addEventListener('transitionend', onEnd);
    const timer = setTimeout(done, 450);
    settling.current = done;
  };
  const morph = () => {
    if (!alive.current || transition.current || !pending.current) return;
    const target = pending.current;
    const commit = () => {
      if (!alive.current) return;
      // Changes queued during capture already include this target's fields.
      if (pending.current === target) pending.current = null;
      onCommit(target.get('q') ?? '');
      updateSearch((p) => {
        for (const key of [...p.keys()]) p.delete(key);
        for (const [key, value] of target) p.set(key, value);
      });
    };
    // iOS Safari clips the moving snapshots at the small viewport, so a tile that slides under the toolbar vanishes mid-morph: a plain swap there.
    if (!document.startViewTransition || reducedMotion() || iosWebKit()) {
      commit();
      return;
    }
    const section = list.current;
    // A settle still in flight is cut short before measuring, so the boxes and the held height agree.
    settling.current?.();
    // Boxes before the commit, so a tile that shrinks can be compensated against where it moves to.
    const boxes = new Map(
      [...grid.current.children].map((tile) => [
        tile,
        tile.getBoundingClientRect()
      ])
    );
    // Predict from the same result selection, fill and dense placement as rendering.
    // Read the current URL here: queued morphs must not plan from an old render.
    const layout = (params) => {
      const result = select(params);
      const cols = Number(
        getComputedStyle(grid.current).getPropertyValue('--cols')
      );
      const filled = fill(result, params)[cols === 2 ? 'mobile' : 'desktop'];
      const rect = grid.current.getBoundingClientRect();
      const css = getComputedStyle(grid.current);
      const gap = parseFloat(css.columnGap);
      const unit = (rect.width - (cols - 1) * gap) / cols;
      const row = parseFloat(css.gridAutoRows);
      return new Map(
        denseLayout(filled, cols).map((cell, i) => [
          result[i]._id,
          {
            x: rect.x + cell.x * (unit + gap),
            y: rect.y + cell.y * (row + parseFloat(css.rowGap)),
            width: cell.width * (unit + gap) - gap,
            height:
              cell.height * (row + parseFloat(css.rowGap)) -
              parseFloat(css.rowGap)
          }
        ])
      );
    };
    const oldLayout = layout(new URLSearchParams(window.location.search));
    const newLayout = layout(target);
    // CSS grid rounds tracks to subpixels. A mismatch beyond rounding means
    // the grid's contract changed: conservatively retain all names.
    const matches = (actual, predicted) =>
      predicted &&
      ['x', 'y', 'width', 'height'].every(
        (key) => Math.abs(actual[key] - predicted[key]) < 1
      );
    const predictable = [...boxes].every(
      ([tile, box]) =>
        !tile.dataset.postId || matches(box, oldLayout.get(tile.dataset.postId))
    );
    // The same tiles in the same cells (a keystroke that narrows nothing) render plainly: no snapshots, no held height.
    const unchanged =
      predictable &&
      oldLayout.size === newLayout.size &&
      [...oldLayout].every(([id, box]) => matches(box, newLayout.get(id)));
    if (unchanged) {
      commit();
      return;
    }
    // A shorter result would shorten the page and clamp the scroll under the morph, so the module holds its height until the end.
    hold(section);
    const skipped = [];
    for (const tile of grid.current.children) {
      const id = tile.dataset.postId;
      if (
        predictable &&
        id &&
        !animatesTile(oldLayout.get(id), newLayout.get(id), {
          width: innerWidth,
          height: innerHeight
        })
      ) {
        skipped.push({ tile, name: tile.style.viewTransitionName });
        tile.style.setProperty('view-transition-name', 'none');
      }
    }
    const curve = easeOut(section)
      .match(/[\d.]+/g)
      .map(Number);
    const compensated = [];
    const copies = [];
    const marks = [];
    const flips = [];
    // Clones of each tile's visible copy lines before the commit, so a line the new shape drops can still leave on screen.
    const departingLines = new Map(
      [...grid.current.children].map((tile) => [
        tile,
        [...(tile.querySelector(`.${styles.text}`)?.children ?? [])]
          .map((line, index) => ({ line, index }))
          .filter(
            ({ line }) =>
              line.tagName === 'P' && getComputedStyle(line).display !== 'none'
          )
          .map(({ line, index }) => ({ line: line.cloneNode(true), index }))
      ])
    );
    transition.current = document.startViewTransition(() => {
      flushSync(() => {
        setMorphing(true);
        commit();
      });
      // A resize/scroll between captures invalidates viewport coordinates.
      // Commit instantly in that case rather than run a partially named morph.
      if (
        skipped.some(
          ({ tile }) =>
            !matches(
              tile.getBoundingClientRect(),
              newLayout.get(tile.dataset.postId)
            )
        )
      )
        transition.current.skipTransition();
      for (const tile of grid.current.children) {
        if (tile.style.viewTransitionName === 'none') continue;
        const before = boxes.get(tile);
        const after = tile.getBoundingClientRect();
        const dots = tile.querySelector(`.${styles.dots}`);
        // Pause child FLIPs before capture so their clock can start with the parent frame.
        for (const animation of dots?.getAnimations({ subtree: true }) ?? []) {
          if (animation.effect?.target === dots) continue;
          animation.pause();
          animation.currentTime = 0;
          flips.push({ tile, animation });
        }
        const text = tile.querySelector(`.${styles.text}`);
        if (
          before &&
          text &&
          (Math.abs(before.width - after.width) > 1 ||
            Math.abs(before.height - after.height) > 1)
        ) {
          // Match the settled tile band, then let its background follow the live copy's reflow.
          const bandExtra =
            parseFloat(getComputedStyle(tile, '::after').height) -
            text.offsetHeight;
          const leaving = [];
          for (const { line, index } of departingLines.get(tile) ?? []) {
            const current = [...text.children].find(
              (child) =>
                child.className === line.className &&
                getComputedStyle(child).display !== 'none'
            );
            if (current) continue;
            // A departing line belongs to this morph alone and is removed before any queued commit.
            line.style.display = 'block';
            line.setAttribute('aria-hidden', 'true');
            text.insertBefore(line, text.children[index] ?? null);
            leaving.push(line);
          }
          // The parent owns corner compensation while each child keeps its sorting transform.
          for (const mark of tile.querySelectorAll(
            `.${styles.dots}, .${styles.star}`
          )) {
            const top =
              mark === dots
                ? tile.dataset.band !== 'top'
                : tile.dataset.band === 'top';
            marks.push({
              tile,
              mark,
              frames: liveFrames(
                before,
                after,
                {
                  x: 'right',
                  y: top ? 'top' : 'bottom',
                  inset: parseFloat(getComputedStyle(mark).right)
                },
                curve
              )
            });
          }
          copies.push({
            tile,
            text,
            leaving,
            bandExtra,
            frames: liveFrames(
              before,
              after,
              { x: 'center', y: tile.dataset.band, reflow: true },
              curve
            )
          });
        }
        const image = tile.querySelector('img');
        if (!before || !image?.complete || !image.naturalWidth) continue;
        const aspect = image.naturalWidth / image.naturalHeight;
        if (!photoShrinks(before, after, aspect)) continue;
        const position = getComputedStyle(image)
          .objectPosition.split(' ')
          .map((value) => parseFloat(value) / 100);
        compensated.push({
          tile,
          image,
          frames: photoFrames(before, after, aspect, position, curve)
        });
      }
    });
    transition.current.ready.then(
      () => {
        const animations = document.getAnimations();
        const groupFor = (tile) =>
          animations.find(
            (animation) =>
              animation.effect?.pseudoElement ===
              `::view-transition-group(${tile.style.viewTransitionName})`
          );
        const syncClock = (animation, group) => {
          if (group.startTime != null) animation.startTime = group.startTime;
        };
        for (const entry of compensated) {
          const group = groupFor(entry.tile);
          if (!group) continue;
          // On the group's own duration and clock, so the photo tracks the frame even when DevTools slows the morph.
          entry.animation = entry.image.animate(entry.frames, {
            duration: group.effect.getTiming().duration,
            fill: 'both'
          });
          syncClock(entry.animation, group);
        }
        for (const entry of [...marks, ...flips]) {
          const group = groupFor(entry.tile);
          if (!group) continue;
          const duration = group.effect.getTiming().duration;
          if (entry.mark) {
            entry.animation = entry.mark.animate(entry.frames, {
              duration,
              fill: 'both'
            });
          } else {
            entry.animation.effect.updateTiming({ duration });
            entry.animation.play();
          }
          syncClock(entry.animation, group);
        }
        for (const entry of copies) {
          const group = groupFor(entry.tile);
          if (!group) continue;
          const duration = group.effect.getTiming().duration;
          entry.tile.setAttribute('data-live-band', '');
          entry.text.style.setProperty('--band-extra', `${entry.bandExtra}px`);
          entry.animations = [
            entry.text.animate(entry.frames, {
              duration,
              fill: 'both'
            })
          ];
          for (const line of entry.leaving) {
            entry.animations.push(
              line.animate(
                [
                  {
                    opacity: 1,
                    height: `${line.offsetHeight}px`,
                    marginTop: '0px'
                  },
                  {
                    opacity: 0,
                    height: '0px',
                    marginTop: `-${getComputedStyle(entry.text).rowGap}`,
                    offset: 0.5
                  },
                  {
                    opacity: 0,
                    height: '0px',
                    marginTop: `-${getComputedStyle(entry.text).rowGap}`
                  }
                ],
                { duration, easing: easeOut(section), fill: 'both' }
              )
            );
          }
          for (const animation of entry.animations) syncClock(animation, group);
        }
      },
      () => {}
    );
    transition.current.finished.finally(() => {
      for (const { animation } of marks) animation?.cancel();
      // Finishing resolves the child FLIP's own cleanup promise even when the morph skips.
      for (const { animation } of flips) animation.finish();
      for (const entry of copies) {
        entry.animations?.forEach((animation) => animation.cancel());
        entry.leaving.forEach((line) => line.remove());
        entry.tile.removeAttribute('data-live-band');
        entry.text.style.removeProperty('--band-extra');
      }
      for (const { animation } of compensated) animation?.cancel();
      for (const { tile, name } of skipped)
        tile.style.viewTransitionName = name;
      transition.current = null;
      setMorphing(false);
      release(section);
      morph();
    });
  };
  const queue = (mutate) => {
    // Coalesce the whole query so search and category changes survive each other.
    const target = new URLSearchParams(
      pending.current ?? window.location.search
    );
    mutate(target);
    pending.current = target;
    morph();
  };
  return { morphing, queue, ownScroll, transition };
}
