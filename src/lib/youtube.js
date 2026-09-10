// Video ids are 11 characters of the URL-safe alphabet; anything else is a
// mistyped link rather than a video.
const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ID_PATHS = ['shorts', 'embed', 'live', 'v'];

function parse(url) {
  if (typeof url !== 'string') return null;
  try {
    return new URL(url.trim());
  } catch {
    return null;
  }
}

export function getYouTubeId(url) {
  const parsed = parse(url);
  if (!parsed) return null;
  const host = parsed.hostname.replace(/^(www|m)\./, '');
  const segments = parsed.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be')
    return ID_PATTERN.test(segments[0]) ? segments[0] : null;
  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;

  const v = parsed.searchParams.get('v');
  if (v && ID_PATTERN.test(v)) return v;
  if (ID_PATHS.includes(segments[0]) && ID_PATTERN.test(segments[1]))
    return segments[1];
  return null;
}

// `t` on a watch link may be bare seconds or the 1h2m3s shorthand; the embed
// player only takes seconds.
export function getYouTubeStart(url) {
  const parsed = parse(url);
  if (!parsed) return null;
  const raw = parsed.searchParams.get('start') ?? parsed.searchParams.get('t');
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);
  const parts = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!parts || !parts.slice(1).some(Boolean)) return null;
  return (
    Number(parts[1] || 0) * 3600 +
    Number(parts[2] || 0) * 60 +
    Number(parts[3] || 0)
  );
}

export const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

export function embedSrc(id, { controls, start, autoplay, mute } = {}) {
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    controls: controls === false ? '0' : '1'
  });
  if (autoplay) params.set('autoplay', '1');
  // Browsers only honour autoplay without a gesture when the player is muted.
  if (mute) params.set('mute', '1');
  if (start) params.set('start', String(start));
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
