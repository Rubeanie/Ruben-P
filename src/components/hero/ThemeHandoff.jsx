'use client';

import { useEffect, useRef } from 'react';
import { setBarColor } from '@/lib/themes';
import ThemeStyle from './ThemeStyle';

const pageBackground = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue('--page-background')
    .trim();

// Flips data-hero-theme off once the hero's bottom edge rises past `line`
// (percent down the viewport; past 100 reaches below the fold for tall
// sticky heroes); ThemeStyle's CSS does the rest. The theme-color meta follows
// the colour in charge. No per-frame work. Without colours it is a plain section.
export default function ThemeHandoff({
  id,
  className,
  colors,
  end,
  line,
  children
}) {
  const ref = useRef(null);
  const heroBackground = colors?.background;

  useEffect(() => {
    if (!heroBackground) return;
    const el = ref.current;
    const root = document.documentElement;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.heroTheme = entry.isIntersecting ? 'on' : 'off';
        setBarColor(entry.isIntersecting ? heroBackground : pageBackground());
        // A reload mid-page lands on the page theme without a fade.
        if (first) {
          first = false;
          requestAnimationFrame(() => (root.dataset.heroSettled = 'true'));
        }
      },
      { rootMargin: `-${line}% 0px ${line - 100}% 0px` }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete root.dataset.heroSettled;
      setBarColor(pageBackground());
    };
  }, [line, heroBackground]);

  return (
    <>
      {colors && <ThemeStyle colors={colors} end={end} />}
      <section
        ref={ref}
        id={id}
        className={className}
        data-hero-theme={colors ? 'on' : undefined}>
        {children}
      </section>
    </>
  );
}
