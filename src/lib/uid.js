import { stegaClean } from '@sanity/client/stega';

export default function uid({ uid = undefined, _key }) {
  return stegaClean(uid) || _key;
}
