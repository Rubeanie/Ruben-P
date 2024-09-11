import { stegaClean } from '@sanity/client/stega';

export default function ({ uid = undefined, _key }) {
  return stegaClean(uid) || _key;
}