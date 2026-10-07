const SIGNED_OUT = 'Sign out and back in to upload.';

// Uploads an image straight from the editor's browser to Cloudinary, into the
// page's folder. The site's members-only route signs the request (see
// lib/cloudinarySign.js); the bytes never pass through it.
export async function uploadToCloudinary(blob, { path, token }) {
  if (!token) throw new Error(SIGNED_OUT);
  const signing = await fetch('/api/studio/cloudinary-sign', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ path }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!signing.ok)
    throw new Error(
      signing.status === 401 ? SIGNED_OUT : 'The upload could not be signed.'
    );
  const { cloudName, apiKey, params, signature } = await signing.json();

  // Exactly the signed params; anything added or changed fails the signature.
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.append(key, value);
  form.append('api_key', apiKey);
  form.append('signature', signature);
  form.append('file', blob);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form, signal: AbortSignal.timeout(60_000) }
  );
  const uploaded = await res.json().catch(() => null);
  if (!res.ok || !uploaded?.secure_url)
    throw new Error(
      uploaded?.error?.message || 'Cloudinary refused the upload.'
    );
  return assetOf(uploaded);
}

// The upload answer in the shape sanity-plugin-cloudinary stores, so every
// reader of a picked asset reads this one too.
const assetOf = (uploaded) => ({
  _type: 'cloudinary.asset',
  id: uploaded.asset_id,
  public_id: uploaded.public_id,
  resource_type: uploaded.resource_type,
  type: uploaded.type,
  format: uploaded.format,
  version: uploaded.version,
  url: uploaded.url,
  secure_url: uploaded.secure_url,
  width: uploaded.width,
  height: uploaded.height,
  bytes: uploaded.bytes,
  tags: uploaded.tags ?? [],
  created_at: uploaded.created_at,
  access_mode: uploaded.access_mode ?? 'public'
});
