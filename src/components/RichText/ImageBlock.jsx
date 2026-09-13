import Image from 'next/image';
import { stegaClean } from '@sanity/client/stega';
import { LuExternalLink } from 'react-icons/lu';
import { isSafeHref } from '@/lib/processUrl';
import { blockLayout } from './layout';
import styles from '@/styles/components/RichText.module.scss';

// Editors can leave the dimensions off a Cloudinary asset; a 3:2 guess keeps
// next/image happy and the aspect ratio is corrected by the intrinsic file.
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 800;

function resolveAsset({ imageType, image, cloudinaryAsset }) {
  if (stegaClean(imageType) === 'cloudinary.asset') {
    const src = cloudinaryAsset?.derived_url || cloudinaryAsset?.secure_url;
    return src
      ? {
          src: stegaClean(src),
          width: cloudinaryAsset.width,
          height: cloudinaryAsset.height
        }
      : null;
  }
  const asset = image?.asset;
  if (!asset?.url) return null;
  return {
    src: stegaClean(asset.url),
    width: asset.metadata?.dimensions?.width,
    height: asset.metadata?.dimensions?.height,
    blurDataURL: asset.metadata?.lqip
  };
}

export default function ImageBlock({ value, sanity }) {
  const resolved = resolveAsset(value ?? {});
  if (!resolved) return null;

  const { src, width, height, blurDataURL } = resolved;
  const { caption, alt, source, loading, placeholder, size, align } = value;
  const blur = stegaClean(placeholder) === 'blur' && blurDataURL;
  const href = stegaClean(source);
  const linked = href && isSafeHref(href) && /^(https?:|\/)/.test(href);
  const layout = blockLayout(stegaClean(size), stegaClean(align));

  const img = (
    <Image
      src={src}
      width={width || FALLBACK_WIDTH}
      height={height || FALLBACK_HEIGHT}
      alt={stegaClean(alt) || ''}
      sizes='(max-width: 43.75rem) 100vw, 65rem'
      loading={stegaClean(loading) || 'lazy'}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur ? blurDataURL : undefined}
    />
  );

  return (
    <figure
      className={styles.figure}
      {...layout}
      {...(sanity && { 'data-sanity': sanity })}>
      {img}
      {linked ? (
        <figcaption>
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.source}>
            {caption || 'Source'}
            <LuExternalLink
              className={styles.sourceIcon}
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <span className={styles.srOnly}>, opens in a new tab</span>
          </a>
        </figcaption>
      ) : (
        caption && <figcaption>{caption}</figcaption>
      )}
    </figure>
  );
}
