import Image from '@/components/CdnImage';
import { stegaClean } from '@sanity/client/stega';
import FigureCaption from './FigureCaption';
import { blockLayout } from './layout';
import { PROSE_SIZES, resolveAsset } from '@/lib/imageBlock';
import styles from '@/styles/components/RichText.module.scss';

// Editors can leave the dimensions off a Cloudinary asset; a 3:2 guess keeps
// next/image happy and the aspect ratio is corrected by the intrinsic file.
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 800;

export default function ImageBlock({ value, sanity, sizes = PROSE_SIZES }) {
  const resolved = resolveAsset(value ?? {});
  if (!resolved) return null;

  const { src, width, height, blurDataURL } = resolved;
  const { caption, alt, source, loading, placeholder, size, align } = value;
  const blur = stegaClean(placeholder) === 'blur' && blurDataURL;
  const layout = blockLayout(stegaClean(size), stegaClean(align));

  return (
    <figure
      className={styles.figure}
      {...layout}
      {...(sanity && { 'data-sanity': sanity })}>
      <Image
        src={src}
        width={width || FALLBACK_WIDTH}
        height={height || FALLBACK_HEIGHT}
        alt={stegaClean(alt) || ''}
        sizes={sizes}
        loading={stegaClean(loading) || 'lazy'}
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur ? blurDataURL : undefined}
      />
      <FigureCaption caption={caption} source={source} />
    </figure>
  );
}
