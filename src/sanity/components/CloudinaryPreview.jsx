// Cloudinary assets carry no Sanity hotspot, so the thumbnail is a centred cover crop.
export function CloudinaryPreview({ url, alt = '' }) {
  return (
    <img
      src={url}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
