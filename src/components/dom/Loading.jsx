'use client';

import { useMemo } from 'react';
import { useSiteLogo } from '@/components/SiteLogo';
import styles from '@/styles/components/Loading.module.scss';

const SHAPES = /<(path|rect|circle|ellipse|polygon|polyline|line)\b/g;

// The CMS logo as a frosted silhouette with a line tracing its outline.
export function Loading() {
  const logo = useSiteLogo();
  const { svg, style } = useMemo(() => {
    const [, , w, h] = (logo.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 1 1')
      .split(/[\s,]+/)
      .map(Number);
    // As an image the SVG sizes itself from width and height, so drop them to
    // let the viewBox fit it exactly like the inline copy.
    const image = logo.replace(/<svg\b[^>]*>/, (tag) =>
      tag.replace(/\s(?:width|height)="[^"]*"/g, '')
    );
    return {
      // Every geometry element measures 100, so dashes are percentages of the outline.
      svg: logo.replace(SHAPES, '<$1 pathLength="100"'),
      style: {
        // It also needs its namespace, which inline markup can omit.
        '--logo-mask': `url("data:image/svg+xml,${encodeURIComponent(
          image.includes('xmlns=')
            ? image
            : image.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
        )}")`,
        '--logo-vbw': w,
        '--logo-vbh': h
      }
    };
  }, [logo]);

  return (
    <div className={styles.loader} style={style} aria-hidden>
      <div className={styles.frost} />
      <div className={styles.line} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
