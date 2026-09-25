import Image from 'next/image';
import { stegaClean } from '@sanity/client/stega';

const photoPosition = (image) =>
  image?.hotspot
    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
    : undefined;

export default function Photo({ image, className, ...rest }) {
  const asset = image?.asset;
  if (!asset?.url) return null;
  const lqip = asset.metadata?.lqip;

  return (
    <div className={className}>
      <Image
        src={asset.url}
        alt={stegaClean(image.alt) || ''}
        fill
        placeholder={lqip ? 'blur' : undefined}
        blurDataURL={lqip}
        style={{ objectFit: 'cover', objectPosition: photoPosition(image) }}
        {...rest}
      />
    </div>
  );
}
