import { useState } from 'react';
import { Flex, Stack, Text } from '@sanity/ui';
import { set, setIfMissing, useFormValue } from 'sanity';
import { sizeFraction } from '@/lib/imageBlock';
import { assetUrl, clipUrls, clipWidthsFor } from '../cloudinaryDerived';
import { clipSettings, MAX_CLIP } from '@/lib/imageLoader';

// Where the site asks for no clip width, the estimate assumes a full-width
// desktop figure 1200px wide, narrowed by the Size option.
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
  const { start, length, fps: chosen } = clipSettings(clip);
  // Original keeps the video's rate, which the asset may not record.
  const fps = chosen || asset?.frame_rate || 30;
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
const CAUTION = { color: 'var(--card-badge-caution-fg-color)' };

// The clip's settings, with what they cost: an estimate until Prepare clip has
// Cloudinary build every rendition the site asks for, then the video's real
// size, until a setting changes.
export function ClipInput(props) {
  const { value, onChange, readOnly } = props;
  const parent = props.path.slice(0, -1);
  const asset = useFormValue([...parent, 'asset']);
  const type = useFormValue(['_type']);
  const holder = useFormValue(parent.slice(0, -1));
  const carousel = useFormValue(parent.slice(0, -3));
  // A cover's 1200 and 1920, a block's or card's own then the phone's.
  const widths = clipWidthsFor(parent, type, holder, carousel);
  const width =
    widths[0] ??
    Math.round(WIDTH * sizeFraction(holder?.size ?? carousel?.size));
  const src = assetUrl(asset);
  // The WebM at the first width comes first, and is the size shown.
  const urls = src ? clipUrls(src, value, widths) : [];
  // The URLs carry the asset's version, the cut and the widths.
  const key = urls.join(' ');
  const prepared = key && value?.preparedFor === key && value?.videoBytes;
  const [attempt, setAttempt] = useState(null);
  const current = attempt?.key === key && attempt;

  const prepare = async () => {
    setAttempt({ key, busy: true });
    try {
      const [videoBytes] = await Promise.all(urls.map(bytesOf));
      onChange([
        setIfMissing({}),
        set(key, ['preparedFor']),
        set(videoBytes, ['videoBytes'])
      ]);
      setAttempt(null);
    } catch {
      setAttempt({ key, failed: true });
    }
  };

  const guess = estimate(asset, value, width);
  const video = prepared
    ? megabytes(value.videoBytes)
    : `up to ~${megabytes(guess.video)}`;

  return (
    <Stack space={4}>
      {props.renderDefault(props)}
      {src && (
        <Stack space={3}>
          <Text size={1} muted>
            Video {video} · as animated image up to ~{megabytes(guess.image)}
          </Text>
          {key && !prepared && (
            <Flex gap={3} wrap='wrap'>
              <Text size={1}>
                <span style={CAUTION}>
                  Not prepared: the first visitor may wait while Cloudinary
                  builds it.
                </span>
              </Text>
              {current?.busy ? (
                <Text size={1} muted>
                  Preparing…
                </Text>
              ) : (
                !readOnly && (
                  <Text size={1}>
                    <button type='button' style={QUIET} onClick={prepare}>
                      {current?.failed
                        ? 'Could not prepare, retry'
                        : 'Prepare clip'}
                    </button>
                  </Text>
                )
              )}
            </Flex>
          )}
        </Stack>
      )}
    </Stack>
  );
}
