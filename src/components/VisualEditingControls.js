import { SanityLive } from '@/lib/sanity/live';
import { DraftModeUi } from '@/components/DraftModeUi';

// Only rendered in draft mode; the layout decides.
export function VisualEditingControls() {
  return (
    <>
      {/* Live updates only while editing: published changes reach visitors
          through the publish webhook, without a Sanity connection per tab. */}
      <SanityLive />
      <DraftModeUi />
    </>
  );
}
