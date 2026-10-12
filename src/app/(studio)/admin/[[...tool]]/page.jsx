import { Studio } from './Studio';
import { metadata as studioMetadata, viewport } from 'next-sanity/studio';

// Ensures the Studio route is statically generated
export const dynamic = 'force-static';

// Extend serverless function timeout
export const maxDuration = 60; // sec

// Set the right `viewport`, `robots` and `referer` meta tags. next-sanity's
// same-origin referrer would send Cloudinary no address, and Strict
// Transformations only builds new thumbnails for a listed site; the origin is enough.
export const metadata = {
  ...studioMetadata,
  referrer: 'strict-origin-when-cross-origin'
};
export { viewport };

export default function StudioPage() {
  return <Studio />;
}
