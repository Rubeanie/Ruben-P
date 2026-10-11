import { VisualEditing } from 'next-sanity/visual-editing';
import { SanityLive } from '@/lib/sanity/live';

// Only rendered in draft mode; the layout decides.
export function VisualEditingControls() {
  return (
    <>
      {/* Live updates only while editing: published changes reach visitors
          through the publish webhook, without a Sanity connection per tab. */}
      <SanityLive />
      <VisualEditing />

      {/* Per Next.js draft-mode docs: a GET route handler needs a full navigation via <form>, not a link, Link prefetch would clear the draft cookie early, and forms are never prefetched. */}
      <form method='GET' action='/api/disable-draft'>
        <button className='draft-disable' type='submit'>
          Disable draft mode
        </button>
      </form>
    </>
  );
}
