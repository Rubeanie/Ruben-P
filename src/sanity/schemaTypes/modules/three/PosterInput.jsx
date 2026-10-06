import { useState } from 'react';
import { Button, Stack, Text, useToast } from '@sanity/ui';
import { set, useClient, useFormValue } from 'sanity';
import { apiVersion } from '@/lib/env';
import snapshotScene from './snapshotScene';

export default function PosterInput(props) {
  const { onChange, renderDefault, readOnly } = props;
  const item = useFormValue(props.path.slice(0, -1)) || {};
  // A carousel card (module › items › card › poster) takes the carousel's
  // aspect ratio, so its poster does too.
  const inCarousel = item._type === 'carouselScene';
  const carousel = useFormValue(props.path.slice(0, inCarousel ? -3 : -1));
  const scene = inCarousel
    ? { ...item, aspectRatio: carousel?.aspectRatio }
    : item;
  const client = useClient({ apiVersion });
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // The same three sources the query resolves for the model and environment.
  const source = (kind) =>
    ({
      file: scene[`${kind}File`]?.asset?._ref,
      url: scene[`${kind}Url`],
      cloudinary: scene[`${kind}Cloudinary`]?.secure_url
    })[scene[`${kind}Source`]];
  const resolve = (kind) =>
    scene[`${kind}Source`] === 'file' && source(kind)
      ? client.fetch('*[_id == $ref][0].url', { ref: source(kind) })
      : source(kind);

  const hasModel = source('model');
  const themed = scene.environmentSource === 'theme';

  const generate = async () => {
    setBusy(true);
    try {
      const blob = await snapshotScene({
        model: await resolve('model'),
        background: scene.background?.hex,
        lights: scene.lights?.hex,
        environmentSource: scene.environmentSource,
        environmentPreset: scene.environmentPreset,
        environment: await resolve('environment'),
        environmentBackground: !themed && scene.environmentBackground,
        keyLight: scene.keyLight,
        bloom: scene.bloom || 'off',
        grain: scene.grain === true ? 'light' : scene.grain,
        vignette: scene.vignette === true ? 'light' : scene.vignette,
        aspectRatio: scene.aspectRatio
      });
      const ext = blob.type.split('/')[1];
      const asset = await client.assets.upload('image', blob, {
        filename: `scene-poster.${ext}`
      });
      onChange(
        set({ _type: 'image', asset: { _type: 'reference', _ref: asset._id } })
      );
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'Could not generate the poster',
        description: error.message
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack space={3}>
      {renderDefault(props)}
      <Button
        text='Generate poster'
        mode='ghost'
        loading={busy}
        disabled={readOnly || !hasModel}
        onClick={generate}
      />
      {!hasModel && (
        <Text size={1} muted>
          Set a model first.
        </Text>
      )}
      {themed && (
        <Text size={1} muted>
          The visitor&apos;s theme is unknown here, so the poster uses the
          neutral studio environment.
        </Text>
      )}
    </Stack>
  );
}
