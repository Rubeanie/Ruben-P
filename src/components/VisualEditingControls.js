import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';

export async function VisualEditingControls() {
  const { isEnabled } = await draftMode();
  return (
    <>
      {isEnabled && (
        <>
          <VisualEditing />

          {/* Per Next.js draft-mode docs: a GET route handler needs a full navigation via <form>, not a link, Link prefetch would clear the draft cookie early, and forms are never prefetched. */}
          <form method='GET' action='/api/disable-draft'>
            <button className='draft-disable' type='submit'>
              Disable draft mode
            </button>
          </form>
        </>
      )}
    </>
  );
}
