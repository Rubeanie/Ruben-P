import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { shareCard } from './card';
import { loadFonts } from './fonts';
import { W, H } from './layout';

// Every platform's large card takes 300 KB; WhatsApp, the tightest, allows 600.
const MAX_BYTES = 300 * 1024;
const QUALITIES = [80, 70, 60];

// JPEG keeps a photo card well under the limit; Satori only writes PNG. A card that still
// comes out over it steps the quality down.
export async function renderShareImage(card) {
  const [element, fonts] = await Promise.all([shareCard(card), loadFonts()]);
  const png = Buffer.from(
    await new ImageResponse(element, {
      width: W,
      height: H,
      fonts
    }).arrayBuffer()
  );
  let jpeg;
  for (const quality of QUALITIES) {
    jpeg = await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer();
    if (jpeg.length <= MAX_BYTES) break;
  }
  return jpeg;
}
