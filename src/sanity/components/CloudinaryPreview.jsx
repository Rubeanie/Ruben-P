import { isClip, stillFrame } from '@/lib/imageLoader';
import { assetUrl } from '../cloudinaryDerived';

// Cloudinary assets carry no Sanity hotspot, so the thumbnail is a centred cover
// crop; a video shows its first frame.
export function CloudinaryPreview({ url, alt = '' }) {
  return (
    <img
      src={isClip(url) ? stillFrame(url) : url}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

// A Cloudinary image field's stored asset as a list preview's media.
export const assetPreview = (asset, alt) =>
  asset && <CloudinaryPreview url={assetUrl(asset)} alt={alt} />;
