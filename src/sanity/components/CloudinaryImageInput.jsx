import { useEffect, useRef, useState } from 'react';
import { Stack, Text } from '@sanity/ui';
import { set, unset } from 'sanity';
import {
  assetUrl,
  readFocus,
  readLqip,
  readPalette
} from '../cloudinaryDerived';

const READ = { palette: readPalette, focus: readFocus, lqip: readLqip };
const DERIVED = Object.keys(READ);

// The image's palette, focal point and placeholder are worked out here, in the
// editor's browser, whenever the asset (or a video's Start) changes, and for
// an image opened without them. The editor never sees or types them.
export function CloudinaryImageInput(props) {
  const { value, onChange, readOnly } = props;
  const url = assetUrl(value?.asset);
  const key = url && `${url} ${value?.clip?.start ?? 0}`;
  // The key that failed to compute in this session, so it isn't retried in a loop.
  const failedKey = useRef(null);
  const complete = DERIVED.every((name) => value?.[name]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (readOnly) return;
    if (!key) {
      // The asset was removed; its derived data goes with it.
      const stale = [...DERIVED, 'derivedFrom'].filter((name) => value?.[name]);
      if (stale.length) onChange(stale.map((name) => unset([name])));
      failedKey.current = null;
      return;
    }
    if (value.derivedFrom === key && complete) return;
    if (failedKey.current === key) return;
    let live = true;
    // Typing a new Start changes the key on every keystroke; let it settle.
    const timer = setTimeout(async () => {
      const results = await Promise.allSettled(
        DERIVED.map((name) => READ[name](url, value.clip))
      );
      if (!live) return;
      const found = Object.fromEntries(
        DERIVED.map((name, i) => [name, results[i].value])
      );
      const ok = DERIVED.every((name) => found[name]);
      failedKey.current = ok ? null : key;
      setFailed(!ok);
      onChange([
        set(key, ['derivedFrom']),
        ...DERIVED.map((name) =>
          found[name] ? set(found[name], [name]) : unset([name])
        )
      ]);
    }, 600);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // value and onChange change on every edit; the key and what's stored say what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, readOnly, value?.derivedFrom, complete]);

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {failed && (
        <Text size={1} muted>
          Could not read this image&apos;s colours or focal point; the site
          falls back to plain defaults.
        </Text>
      )}
    </Stack>
  );
}
