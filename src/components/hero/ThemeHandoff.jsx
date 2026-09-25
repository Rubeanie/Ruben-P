'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/ThemeContext';
import { SITE_BAR_COLOR } from '@/lib/themes';
import ThemeStyle from './ThemeStyle';

// Android Chrome tints its bars from this meta only.
function setBarColor(value) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && value) meta.content = value;
}

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
  const page = useTheme().colors;
  const heroBackground = colors?.background;

  // The page theme can resolve after the flip.
  useEffect(() => {
    if (ref.current.dataset.heroTheme === 'off') setBarColor(pageBackground());
  }, [page]);

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
      setBarColor(SITE_BAR_COLOR);
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
