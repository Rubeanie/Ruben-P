import { cloudinaryTransform, isClip, stillFrame } from '@/lib/imageLoader';
import { assetUrl } from '../cloudinaryDerived';

// Cloudinary assets carry no Sanity hotspot, so the thumbnail is a centred cover
// crop; a video shows its first frame. One small size serves every list, and a
// clip's still is already WebP.
const thumb = (url) =>
  isClip(url)
    ? cloudinaryTransform(stillFrame(url), 'c_fill,w_200,h_200,q_auto')
    : cloudinaryTransform(url, 'c_fill,w_200,h_200,f_auto,q_auto');

export function CloudinaryPreview({ url, alt = '' }) {
  return (
    <img
      src={thumb(url)}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

// A Cloudinary image field's stored asset as a list preview's media.
export const assetPreview = (asset, alt) =>
  asset && <CloudinaryPreview url={assetUrl(asset)} alt={alt} />;
