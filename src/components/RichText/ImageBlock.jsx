import ClipVideo from '@/components/ClipVideo';
import Image from '@/components/CdnImage';
import { stegaClean } from '@sanity/client/stega';
import FigureCaption from './FigureCaption';
import { blockLayout } from './layout';
import {
  PROSE_SIZES,
  clipWidth,
  resolveImage,
  sizedSizes
} from '@/lib/imageBlock';
import styles from '@/styles/components/RichText.module.scss';

// Editors can leave the dimensions off a Cloudinary asset; a 3:2 guess keeps
// next/image happy and the aspect ratio is corrected by the intrinsic file.
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 800;

export default function ImageBlock({
  value,
  sanity,
  sizes = PROSE_SIZES,
  lead
}) {
  const resolved = resolveImage(value?.image);
  if (!resolved) return null;

  const { src, still, width, height, clip, placeholder } = resolved;
  const { caption, alt, source, loading, size, align } = value;
  const layout = blockLayout(stegaClean(size), stegaClean(align));
  const blockSizes = sizedSizes(sizes, layout['data-size']);

  const image = (
    <Image
      src={clip?.video ? still : src}
      clip={clip}
      width={width || FALLBACK_WIDTH}
      height={height || FALLBACK_HEIGHT}
      alt={stegaClean(alt) || ''}
      sizes={blockSizes}
      loading={lead ? 'eager' : stegaClean(loading) || 'lazy'}
      fetchPriority={lead ? 'high' : undefined}
      placeholder={placeholder}
    />
  );

  return (
    <figure
      className={styles.figure}
      {...layout}
      {...(sanity && { 'data-sanity': sanity })}>
      {clip?.video ? (
        // The clip plays over its first frame, in the frame's box.
        <div className={styles.clip}>
          {image}
          <ClipVideo
            src={src}
            clip={clip}
            width={clipWidth(blockSizes)}
            className={styles.over}
          />
        </div>
      ) : (
        image
      )}
      <FigureCaption caption={caption} source={source} />
    </figure>
  );
}
