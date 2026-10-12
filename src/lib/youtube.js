import { preconnect } from 'react-dom';

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

export function embedSrc(id, { controls, start, autoplay, mute, api } = {}) {
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    controls: controls === false ? '0' : '1'
  });
  if (autoplay) params.set('autoplay', '1');
  // Browsers only honour autoplay without a gesture when the player is muted.
  if (mute) params.set('mute', '1');
  if (start) params.set('start', String(start));
  if (api) {
    params.set('enablejsapi', '1');
    params.set('origin', window.location.origin);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

// iOS Safari does not carry a tap into a freshly created cross-origin iframe,
// so autoplay=1 stalls on YouTube's own play button. Driving the player through
// the IFrame API from the page keeps the gesture. Desktop Safari and iPadOS
// (which reports as a Mac) take the same route.
export function isApple() {
  const { vendor, platform, maxTouchPoints } = navigator;
  return (
    vendor.includes('Apple') || (platform === 'MacIntel' && maxTouchPoints > 1)
  );
}

// Touch-only Apple devices build the player ahead of the tap, so the tap lands
// inside its frame. A pointer that hovers keeps the tap-to-load route.
export function prebuildsPlayer() {
  return isApple() && matchMedia('(hover: none)').matches;
}

// Intent to play is the cheapest moment to open the sockets the embed needs.
export function warmEmbed() {
  preconnect('https://www.youtube-nocookie.com');
  preconnect('https://www.google.com');
}

let playerApi = null;

// One script load shared by every video on the page. A script that never
// readies (blocked, stalled) rejects after a while so callers fall back.
const PLAYER_API_TIMEOUT = 8000;

export function loadPlayerApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  playerApi ??= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const script = document.createElement('script');
    // Settles once, so a timed-out attempt's late callbacks can't undo a retry.
    let settled = false;
    const fail = (message) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      playerApi = null;
      if (window.onYouTubeIframeAPIReady === ready)
        window.onYouTubeIframeAPIReady = previous;
      script.remove();
      reject(new Error(message));
    };
    const ready = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(window.YT);
      previous?.();
    };
    const timer = setTimeout(
      () => fail('YouTube player API timed out'),
      PLAYER_API_TIMEOUT
    );
    window.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => fail('YouTube player API failed to load');
    document.head.append(script);
  });
  return playerApi;
}

// Once the page has loaded, so warm-ups never compete with its first paint.
// Safari's requestIdleCallback support is patchy, so a short timeout stands in.
export function whenIdle(callback) {
  const idle = window.requestIdleCallback ?? ((run) => setTimeout(run, 200));
  const cancel = window.cancelIdleCallback ?? clearTimeout;
  let handle;
  const run = () => {
    handle = idle(callback);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancel(handle);
    window.removeEventListener('load', run);
  };
}

// YouTube only renders the 1280px poster for some videos; the rest answer 404, so ask first.
export async function getThumb(id) {
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  try {
    const response = await fetch(maxres, {
      method: 'HEAD',
      cache: 'force-cache',
      next: { tags: ['pages'] }
    });
    if (response.ok) return maxres;
  } catch {
    // fall through to the poster every video has
  }
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

// oEmbed gives the real title for the facade's caption and aria-label.
export async function getTitle(id) {
  const fallback = 'YouTube video';
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      // Refreshed by the publish webhook, like the page around it.
      { cache: 'force-cache', next: { tags: ['pages'] } }
    );
    if (!response.ok) return fallback;
    const data = await response.json();
    return data.title || fallback;
  } catch {
    return fallback;
  }
}
