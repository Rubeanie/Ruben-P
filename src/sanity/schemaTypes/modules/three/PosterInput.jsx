import { useState } from 'react';
import { Button, Stack, Text, useToast } from '@sanity/ui';
import { set, useClient, useFormValue } from 'sanity';
import { apiVersion } from '@/lib/env';
import { folderFor } from '@/lib/cloudinaryFolder';
import { isPagePath } from '@/lib/slug';
import { CloudinaryImageInput } from '../../../components/CloudinaryImageInput';
import { uploadToCloudinary } from '../../../cloudinaryUpload';
import snapshotScene from './snapshotScene';

export default function PosterInput(props) {
  const { value, onChange, readOnly } = props;
  const item = useFormValue(props.path.slice(0, -1)) || {};
  // A carousel card (module › items › card › poster) takes the carousel's
  // aspect ratio, so its poster does too.
  const inCarousel = item._type === 'carouselScene';
  const carousel = useFormValue(props.path.slice(0, inCarousel ? -3 : -1));
  const scene = inCarousel
    ? { ...item, aspectRatio: carousel?.aspectRatio }
    : item;
  // The poster goes into the page's own Cloudinary folder, named by its path.
  const path = useFormValue(['metadata', 'slug', 'current']);
  const folder = isPagePath(path) && folderFor(path);
  const client = useClient({ apiVersion });
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // The same sources the query resolves for the model and environment.
  const model =
    scene.modelSource === 'url'
      ? scene.modelUrl
      : scene.modelCloudinary?.secure_url;
  const environment = {
    url: scene.environmentUrl,
    cloudinary: scene.environmentCloudinary?.secure_url
  }[scene.environmentSource];
  const themed = scene.environmentSource === 'theme';

  const generate = async () => {
    setBusy(true);
    try {
      const blob = await snapshotScene({
        model,
        background: scene.background?.hex,
        lights: scene.lights?.hex,
        environmentSource: scene.environmentSource,
        environmentPreset: scene.environmentPreset,
        environment,
        environmentBackground: !themed && scene.environmentBackground,
        keyLight: scene.keyLight,
        bloom: scene.bloom || 'off',
        grain: scene.grain === true ? 'light' : scene.grain,
        vignette: scene.vignette === true ? 'light' : scene.vignette,
        aspectRatio: scene.aspectRatio
      });
      const asset = await uploadToCloudinary(blob, {
        path,
        token: client.config().token
      });
      // A whole new value, so nothing of an older poster's derived data or
      // type survives; the shared input below reads the new one's.
      onChange(
        set({
          _type: 'cloudinaryImage',
          asset,
          ...(value?.blur === false && { blur: false })
        })
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
      {/* A field's own input replaces its type's, so the shared one that
          fills the derived data is rendered here by hand. */}
      <CloudinaryImageInput {...props} />
      <Button
        text='Generate poster'
        mode='ghost'
        loading={busy}
        disabled={readOnly || !model || !folder}
        onClick={generate}
      />
      {!model && (
        <Text size={1} muted>
          Set a model first.
        </Text>
      )}
      <Text size={1} muted>
        {folder
          ? `Saved to ${folder} on Cloudinary.`
          : 'Give the page a slug first; the poster is stored in its folder.'}
      </Text>
      {themed && (
        <Text size={1} muted>
          The visitor&apos;s theme is unknown here, so the poster uses the
          neutral studio environment.
        </Text>
      )}
    </Stack>
  );
}
