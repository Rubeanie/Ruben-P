import { apiVersion } from '@/lib/env';

const normalise = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase();
// Published id of a document, draft or release version.
const baseId = (id) => id.replace(/^(?:drafts|versions\.[^.]+)\./, '');

// A name another document of the same type, in any version, doesn't share.
export const uniqueName = (Rule) =>
  Rule.required().custom(async (name, { document, getClient }) => {
    if (!name) return true;
    const self = baseId(document._id);
    const client = getClient({ apiVersion }).withConfig({ perspective: 'raw' });
    const others = await client.fetch(
      `*[_type == $type && defined(name)]{ _id, name }`,
      { type: document._type }
    );
    return others.some(
      (other) =>
        baseId(other._id) !== self && normalise(other.name) === normalise(name)
    )
      ? `Another ${document._type} has this name.`
      : true;
  });
