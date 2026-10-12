'use client';

import { useEffect, useRef, useState } from 'react';
import { getImageProps } from 'next/image';
import { stegaClean } from '@sanity/client/stega';
import Image from '@/components/CdnImage';
import ClipVideo from '@/components/ClipVideo';
import { clipWidth } from '@/lib/imageBlock';
import { loaderFor } from '@/lib/imageLoader';

// Cover-fit around the subject, over the rendition's placeholder, which
// next/image frames by the same style.
const imageProps = (
  { image, src, sizes, placeholder = image.placeholder },
  rest
) => ({
  src,
  fill: true,
  sizes,
  placeholder,
  style: { objectFit: 'cover', objectPosition: image.position },
  ...rest
});

// A clip plays over its still, filling and framed the same.
const over = (image) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: image.position
});

// A hero's photo, from heroPhotos. A pair art-directs the phone's portrait cut:
// one <picture>, so a screen downloads only the rendition it shows.
export default function Photo({ photos, alt, className, ...rest }) {
  const [photo, phone] = photos ?? [];
  if (!photo) return null;
  const text = stegaClean(alt) || '';
  if (phone)
    return (
      <Pair
        photos={[photo, phone]}
        alt={text}
        className={className}
        {...rest}
      />
    );

  const { image } = photo;
  return (
    <div className={className}>
      {/* CdnImage picks the loader itself: a function can't cross into it. */}
      <Image {...imageProps(photo, rest)} clip={image.clip} alt={text} />
      {image.clip?.video && (
        <ClipVideo
          src={image.src}
          clip={image.clip}
          width={clipWidth(photo.sizes)}
          style={over(image)}
        />
      )}
    </div>
  );
}

// next/image clears its placeholder once the photo decodes, but this <img> is
// drawn by hand: it does the same, so none shows through a transparent photo
// and no blank frame shows between. A failed decode clears it too; a source
// swapped or unmounted meanwhile leaves it to the newer load.
function settle(node, done) {
  const src = node.currentSrc;
  const clear = () => node.isConnected && node.currentSrc === src && done();
  node.decode().then(clear, clear);
}

function Pair({ photos, alt, className, onLoad, ...rest }) {
  const img = useRef(null);
  const [loaded, setLoaded] = useState(false);
  // A cached photo can finish before hydration, with no load event to catch.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth)
      settle(img.current, () => setLoaded(true));
  }, []);

  const [desktop, portrait] = photos.map(
    (photo) =>
      getImageProps({
        ...imageProps(photo, rest),
        loader: loaderFor(photo.src),
        alt
      }).props
  );
  const placeholder = (props) =>
    loaded ? undefined : props.style.backgroundImage;
  return (
    <div className={className}>
      <picture>
        <source
          media={photos[1].media}
          srcSet={portrait.srcSet}
          sizes={portrait.sizes}
        />
        <img
          {...desktop}
          ref={img}
          alt={alt}
          onLoad={(event) => {
            settle(event.currentTarget, () => setLoaded(true));
            onLoad?.(event);
          }}
          // Each rendition's framing and placeholder, which the stylesheet
          // swaps at the phone breakpoint.
          style={{
            ...desktop.style,
            objectPosition: undefined,
            backgroundImage: undefined,
            backgroundPosition: undefined,
            '--position': desktop.style.objectPosition,
            '--placeholder': placeholder(desktop),
            '--phone-placeholder': placeholder(portrait)
          }}
        />
      </picture>
    </div>
  );
}
