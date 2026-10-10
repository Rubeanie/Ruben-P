import { Flex, Stack, Text } from '@sanity/ui';
import { LuFileBox } from 'react-icons/lu';
import { cloudinaryAssetSchema } from 'sanity-plugin-cloudinary';
import { cloudinaryTransform } from '@/lib/imageLoader';
import { CloudinaryPreview } from '../../../components/CloudinaryPreview';

// The plugin's own picker; renderDefault would fall back to the raw object fields.
const CloudinaryInput = cloudinaryAssetSchema.components.input;

// Cloudinary keeps a GLB as an image asset and renders it to a picture when
// asked for a .png. The plugin asks without an extension and gets an error.
// A raw upload has no renderer, so it stays a file.
const isModel = (url) => /\/image\/upload\/.+\.(glb|gltf)$/i.test(url ?? '');
const modelThumbnail = (url) =>
  cloudinaryTransform(url, 'w_400').replace(/\.(glb|gltf)$/i, '.png');

// A model's picture as a list preview's media.
export const modelPreview = (url) =>
  isModel(url) ? <CloudinaryPreview url={modelThumbnail(url)} /> : undefined;

export default function ModelInput(props) {
  const { value } = props;
  if (isModel(value?.secure_url)) {
    // For display only: the picker reads just the id and type from the value.
    const shown = {
      ...value,
      derived: [{ secure_url: modelThumbnail(value.secure_url) }]
    };
    return <CloudinaryInput {...props} value={shown} />;
  }
  // An HDRI has no picture, so the plugin's preview would be a broken image,
  // unless it's a raw upload, which the plugin already shows as a file.
  const showFile = value?.public_id && value.resource_type !== 'raw';
  return (
    <Stack space={3}>
      {showFile && (
        <Flex align='center' gap={2}>
          <LuFileBox />
          <Text size={1}>{value.display_name ?? value.public_id}</Text>
        </Flex>
      )}
      <div className={showFile ? 'cloudinary-file' : undefined}>
        <CloudinaryInput {...props} />
      </div>
    </Stack>
  );
}
