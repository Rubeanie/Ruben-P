'use client';

import Image, { getImageProps } from 'next/image';
import { isAnimated, loaderFor, stillFrame } from '@/lib/imageLoader';

// A loader is a function, which a server component can't hand to next/image,
// so the choice of loader lives here.
export default function CdnImage({ src, alt, clip, ...rest }) {
  const image = (
    <Image src={src} alt={alt} loader={loaderFor(src, clip)} {...rest} />
  );
  if (!isAnimated(src)) return image;

  // Reduced motion shows the first frame (WCAG 2.2.2). The browser picks the
  // source, so it holds on the server render too; the picture adds no box.
  const still = stillFrame(src, clip);
  const { props } = getImageProps({
    src: still,
    alt,
    loader: loaderFor(still),
    ...rest
  });
  return (
    <picture style={{ display: 'contents' }}>
      <source
        media='(prefers-reduced-motion: reduce)'
        srcSet={props.srcSet}
        sizes={props.sizes}
      />
      {image}
    </picture>
  );
}
