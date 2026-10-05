'use client';

import Image from 'next/image';
import { cdnLoader, hasCdnLoader } from '@/lib/imageLoader';

// A loader is a function, which a server component can't hand to next/image,
// so the choice of loader lives here.
export default function CdnImage({ src, alt, ...rest }) {
  return (
    <Image
      src={src}
      alt={alt}
      loader={
        typeof src === 'string' && hasCdnLoader(src) ? cdnLoader : undefined
      }
      {...rest}
    />
  );
}
