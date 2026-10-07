import Image from '@/components/CdnImage';
import { getImageProps } from 'next/image';
import { stegaClean } from '@sanity/client/stega';
import { isAnimated, loaderFor, stillFrame } from '@/lib/imageLoader';

const photoPosition = (image) =>
  image?.hotspot
    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
    : undefined;

function imageProps(image, rest) {
  const { url, metadata } = image.asset;
  return {
    src: url,
    fill: true,
    loader: loaderFor(url),
    placeholder: metadata?.lqip ? 'blur' : undefined,
    blurDataURL: metadata?.lqip,
    style: { objectFit: 'cover', objectPosition: photoPosition(image) },
    ...rest
  };
}

// An animated source's first frame, for the reduced-motion sources below.
function still(image, rest) {
  const { url } = image.asset;
  const { props } = getImageProps({
    ...imageProps(image, rest),
    src: stillFrame(url),
    loader: loaderFor(stillFrame(url)),
    alt: ''
  });
  return props;
}

const REDUCED = '(prefers-reduced-motion: reduce)';

// `mobile` ({ image, sizes, media }) art-directs a second photo: one <picture>,
// so a screen downloads only the photo it shows. Each photo's hotspot and blur
// go in custom properties the stylesheet swaps at the same breakpoint.
export default function Photo({ image, mobile, className, ...rest }) {
  if (!image?.asset?.url) return null;
  const alt = stegaClean(image.alt) || '';

  if (!mobile) {
    // CdnImage picks the loader itself: a function can't cross into it.
    const { loader, ...props } = imageProps(image, rest);
    return (
      <div className={className}>
        <Image {...props} alt={alt} />
      </div>
    );
  }

  const { props: desktop } = getImageProps({ ...imageProps(image, rest), alt });
  const { props: phone } = getImageProps({
    ...imageProps(mobile.image, { ...rest, sizes: mobile.sizes }),
    alt
  });
  return (
    <div className={className}>
      <picture>
        {/* Reduced motion gets the first frame (WCAG 2.2.2); each still sits
            beside its photo's source so the art direction holds. */}
        {isAnimated(mobile.image.asset.url) && (
          <source
            media={`${mobile.media} and ${REDUCED}`}
            srcSet={
              still(mobile.image, { ...rest, sizes: mobile.sizes }).srcSet
            }
            sizes={mobile.sizes}
          />
        )}
        <source
          media={mobile.media}
          srcSet={phone.srcSet}
          sizes={phone.sizes}
        />
        {isAnimated(image.asset.url) && (
          <source
            media={REDUCED}
            srcSet={still(image, rest).srcSet}
            sizes={desktop.sizes}
          />
        )}
        <img
          {...desktop}
          alt={alt}
          style={{
            ...desktop.style,
            objectPosition: undefined,
            backgroundImage: undefined,
            backgroundPosition: undefined,
            '--position': desktop.style.objectPosition,
            '--blur': desktop.style.backgroundImage,
            '--mobile-position': phone.style.objectPosition,
            '--mobile-blur': phone.style.backgroundImage
          }}
        />
      </picture>
    </div>
  );
}
