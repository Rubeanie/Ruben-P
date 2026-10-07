import { createSignHandler } from '@/lib/cloudinarySign';

// Signs Studio uploads to Cloudinary for signed-in members; see cloudinarySign.js.
export const POST = createSignHandler();
