import { VisualEditing } from 'next-sanity';
import { draftMode } from 'next/headers';

export function VisualEditingControls() {
  return (
    <>
      {draftMode().isEnabled && (
        <>
          <VisualEditing />

          <a className='draft-disable' href='/api/disable-draft'>
            Disable draft mode
          </a>
        </>
      )}
    </>
  );
}
