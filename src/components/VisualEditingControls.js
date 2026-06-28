import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';

export async function VisualEditingControls() {
  const { isEnabled } = await draftMode();
  return (
    <>
      {isEnabled && (
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
