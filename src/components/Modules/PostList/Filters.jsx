'use client';

import { useEffect, useRef } from 'react';
import { stegaClean } from '@sanity/client/stega';
import { LuSearch, LuX } from 'react-icons/lu';
import { inkFor } from '@/lib/posts';
import styles from '@/styles/components/PostList.module.scss';

// One scrolling line of chips in a fixed order; the selected chip fills in place.
function ChipRow({ categories, value, onChange }) {
  const row = useRef(null);
  // A filter, not a tab strip: no All chip, and the selected chip toggles off.
  // A newly selected chip out of view is brought in; never on mount, so Back or a shared link does not scroll the page here.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const chip = row.current?.querySelector('[aria-pressed="true"]');
    chip?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [value]);
  // The trailing fade only while there is more strip to the right.
  useEffect(() => {
    const el = row.current;
    const more = () =>
      el.toggleAttribute(
        'data-more',
        el.scrollLeft + el.clientWidth < el.scrollWidth - 1
      );
    more();
    el.addEventListener('scroll', more, { passive: true });
    const ro = new ResizeObserver(more);
    ro.observe(el);
    // The chips reflow on their own when the web font lands, without the row changing size.
    for (const chip of el.children) ro.observe(chip, { box: 'border-box' });
    return () => {
      el.removeEventListener('scroll', more);
      ro.disconnect();
    };
  }, []);
  return (
    <div
      ref={row}
      className={styles.chips}
      role='group'
      aria-label='Filter by category'>
      {categories.map((c) => {
        const color = stegaClean(c.color?.hex);
        const pressed = value === c._id;
        return (
          <button
            key={c._id}
            type='button'
            className={styles.chip}
            aria-pressed={pressed}
            data-ink={color && pressed ? inkFor(color) : undefined}
            style={color ? { '--chip': color } : undefined}
            // A pointer press must not pull focus out of the search, so the caret and open field survive a chip click.
            onPointerDown={(event) => event.preventDefault()}
            // iOS blurs the field from the touch itself, so the tap is taken at touchend and its mouse events cancelled; a scrolled touch is not cancelable and is left alone.
            onTouchEnd={(event) => {
              if (!event.cancelable) return;
              event.preventDefault();
              onChange(pressed ? null : c._id);
            }}
            onClick={() => onChange(pressed ? null : c._id)}>
            {c.title}
          </button>
        );
      })}
    </div>
  );
}

// A glyph-only capsule that opens into a field on focus or once it holds text.
function SearchField({ value, onChange, inputRef }) {
  const wrap = useRef(null);
  // Set by a press, read by the focus it causes: a keyboard focus opens the field without the width easing.
  const pointer = useRef(false);
  return (
    <div
      ref={wrap}
      className={styles.search}
      data-filled={value ? '' : undefined}
      onPointerDown={(event) => {
        pointer.current = true;
        // The 44px band belongs to the wrapper, so a press there has to reach the input.
        if (event.target === event.currentTarget) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }}>
      <LuSearch
        className={styles.searchIcon}
        strokeWidth={1.75}
        aria-hidden='true'
      />
      <input
        ref={inputRef}
        type='search'
        className={styles.searchInput}
        placeholder='Search'
        aria-label='Search projects'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (!pointer.current) wrap.current.setAttribute('data-instant', '');
          pointer.current = false;
        }}
        onBlur={() => {
          wrap.current.removeAttribute('data-instant');
          pointer.current = false;
        }}
        onKeyDown={(event) => {
          // Search inputs clear on Escape natively; an accidental press must not wipe the query.
          if (event.key === 'Escape') event.preventDefault();
        }}
      />
      {/* Always in its slot so the text area never changes width; it fades in as feedback once there is text. */}
      <button
        type='button'
        className={styles.searchClear}
        aria-label='Clear search'
        inert={!value || undefined}
        onClick={() => {
          onChange('');
          inputRef.current?.focus();
        }}>
        <LuX strokeWidth={2} aria-hidden='true' />
      </button>
    </div>
  );
}

export default function Filters({
  categories,
  category,
  onCategory,
  text,
  onText,
  inputRef
}) {
  return (
    <div className={styles.filters}>
      <SearchField value={text} onChange={onText} inputRef={inputRef} />
      {categories.length > 0 && (
        <ChipRow
          categories={categories}
          value={category}
          onChange={onCategory}
        />
      )}
    </div>
  );
}
