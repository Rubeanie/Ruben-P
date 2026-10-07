import { CLIP_FPS, MAX_CLIP } from '@/lib/imageLoader';
import { ClipInput } from '../../../components/ClipInput';

// A Cloudinary video's cut, beside the asset in an image field, shown only once
// a video is picked. `animatedImage` lets the editor force the heavier animated
// image over the video.
export const clipField = {
  name: 'clip',
  title: 'Clip',
  description: `Videos play for at most ${MAX_CLIP} seconds; pick the part to show.`,
  type: 'object',
  options: { collapsible: true, collapsed: false },
  hidden: ({ parent }) => parent?.asset?.resource_type !== 'video',
  components: { input: ClipInput },
  // The clip's parent holds the asset, and so the video's duration.
  validation: (Rule) =>
    Rule.custom((clip, { parent }) => {
      const duration = parent?.asset?.duration;
      return !duration || !(clip?.start >= duration)
        ? true
        : `Starts after the video ends (${duration.toFixed(1)} s).`;
    }),
  fields: [
    {
      name: 'start',
      type: 'number',
      description: 'Seconds into the video.',
      initialValue: 0,
      validation: (Rule) => Rule.min(0)
    },
    {
      name: 'length',
      type: 'number',
      description: `Seconds; blank plays to the end, up to ${MAX_CLIP}.`,
      validation: (Rule) => Rule.positive().max(MAX_CLIP)
    },
    {
      name: 'fps',
      title: 'Smoothness',
      type: 'number',
      description: 'Frames a second; fewer make a lighter file.',
      options: {
        list: [
          ...CLIP_FPS.map((fps) => ({ title: `${fps} fps`, value: fps })),
          { title: 'Original', value: 0 }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 15
    },
    // Loops unless told otherwise: an unset switch reads as off, so the
    // default is the switch being off.
    {
      name: 'playOnce',
      title: 'Play once',
      type: 'boolean',
      description: 'Stops on the last frame instead of looping.'
    },
    {
      name: 'animatedImage',
      title: 'Force animated image',
      type: 'boolean',
      description:
        'Plays as an animated image instead of a video: many times heavier.',
      initialValue: false
    }
  ]
};
