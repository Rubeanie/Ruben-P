'use client';

import { useSyncExternalStore } from 'react';
import { VisualEditing } from 'next-sanity/visual-editing';

const framed = () => window.self !== window.top;
const subscribe = () => () => {};

// The Studio's Presentation tool frames the site and gets the edit outlines.
// Any other tab in draft mode just browses the drafts, with a way out.
export function DraftModeUi() {
  const inStudio = useSyncExternalStore(subscribe, framed, () => false);
  if (inStudio) return <VisualEditing />;
  return (
    // Per Next.js draft-mode docs: a GET route handler needs a full navigation
    // via <form>, not a link; Link prefetch would clear the draft cookie early,
    // and forms are never prefetched.
    <form method='GET' action='/api/disable-draft'>
      <button className='draft-disable' type='submit'>
        Disable draft mode
      </button>
    </form>
  );
}
