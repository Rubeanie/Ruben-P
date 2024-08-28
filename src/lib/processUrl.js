import { stegaClean } from '@sanity/client/stega'
import { BASE_URL } from '@sanity/src/env';

export default function (page,
  {
    base = true,
    params
  } = {}
) {
  const slug = page.metadata?.slug?.current;
  const path = slug === 'index' ? null : slug;

  return (
    (base ? BASE_URL + '/' : '/') +
    [path, stegaClean(params)].filter(Boolean).join('/')
  )
}