import { useState } from 'react';
import { Flex, Stack, Text } from '@sanity/ui';
import { useFormValue } from 'sanity';
import { sizeFraction } from '@/lib/imageBlock';
import { assetUrl } from '../cloudinaryDerived';
import {
  animatedClip,
  clipSettings,
  clipVideo,
  MAX_CLIP
} from '@/lib/imageLoader';

// What the estimate and the measurement assume: a full-width desktop figure
// 1200px wide, narrowed by the Size option.
const WIDTH = 1200;
// A ceiling, not an average: the heaviest of six Cloudinary sample clips cut
// to 4 s at 1200x675 and 15 fps. Its VP9 WebM, which most browsers get, took
// 0.13 bytes a pixel a second (the lightest 0.005), its animated WebP 0.047
// bytes a pixel a frame (lightest 0.02). Video grows slower than its frame rate
// (hence the square root).
const WEBP_BYTES = 0.047;
const VIDEO_BYTES = 0.13;

const megabytes = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;

function estimate(asset, clip, target) {
  const { start, length, fps: set } = clipSettings(clip);
  // Original keeps the video's rate, which the asset may not record.
  const fps = set || asset?.frame_rate || 30;
  const seconds = Math.min(
    length,
    asset?.duration ? Math.max(asset.duration - start, 0) : MAX_CLIP
  );
  const width = Math.min(target, asset?.width || target);
  const pixels =
    width *
    width *
    (asset?.height && asset?.width ? asset.height / asset.width : 9 / 16);
  return {
    video: seconds * pixels * VIDEO_BYTES * Math.sqrt(fps / 15),
    image: seconds * fps * pixels * WEBP_BYTES
  };
}

// HEAD gives the size once Cloudinary has made the file; until then it says
// 200 with no length, and a range request still streams the whole file. So a
// plain GET measures it, and is also what makes Cloudinary generate it.
async function bytesOf(url) {
  const head = await fetch(url, { method: 'HEAD' });
  const length = Number(head.headers.get('content-length'));
  if (head.ok && length > 0) return length;
  const response = await fetch(url);
  if (response.ok) return (await response.blob()).size;
  throw new Error(`No size for ${url}`);
}

// Plain coloured text, but a real button: keyboard reachable, focus ring kept.
const QUIET = {
  padding: 0,
  border: 0,
  background: 'none',
  font: 'inherit',
  color: 'var(--card-link-fg-color)',
  cursor: 'pointer'
};

// The clip's settings, with what they cost: an instant estimate, and the real
// sizes of both renditions on request, until a setting changes.
export function ClipInput(props) {
  const parent = props.path.slice(0, -1);
  const asset = useFormValue([...parent, 'asset']);
  // The image block's own Size, or the carousel's three levels up, narrows the
  // file; a cover has neither and runs full width.
  const own = useFormValue([...parent.slice(0, -1), 'size']);
  const carousel = useFormValue([...parent.slice(0, -3), 'size']);
  const width = Math.round(WIDTH * sizeFraction(own ?? carousel));
  const src = assetUrl(asset);
  const urls = src && {
    video: clipVideo(src, width, props.value, 'webm'),
    image: animatedClip(src, `c_limit,w_${width}`, props.value)
  };
  const key = urls && `${urls.video} ${urls.image}`;
  const [measured, setMeasured] = useState(null);
  const real = measured?.key === key && measured;

  const measure = async () => {
    setMeasured({ key, busy: true });
    try {
      const [video, image] = await Promise.all([
        bytesOf(urls.video),
        bytesOf(urls.image)
      ]);
      setMeasured({ key, video, image });
    } catch {
      setMeasured({ key, failed: true });
    }
  };

  const guess = estimate(asset, props.value, width);
  const sizes = real?.video
    ? `Video ${megabytes(real.video)} · as animated image ${megabytes(real.image)}`
    : `Video up to ~${megabytes(guess.video)} · as animated image up to ~${megabytes(guess.image)}`;

  return (
    <Stack space={4}>
      {props.renderDefault(props)}
      {urls && (
        <Flex gap={3} wrap='wrap'>
          <Text size={1} muted>
            {sizes}
          </Text>
          {real?.busy ? (
            <Text size={1} muted>
              measuring…
            </Text>
          ) : (
            !real?.video && (
              <Text size={1}>
                <button type='button' style={QUIET} onClick={measure}>
                  {real?.failed
                    ? 'could not measure, retry'
                    : 'check real size'}
                </button>
              </Text>
            )
          )}
        </Flex>
      )}
    </Stack>
  );
}
