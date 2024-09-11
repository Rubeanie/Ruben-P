'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/../sanity/sanity.config';

export { metadata, viewport } from 'next-sanity/studio';

export function Studio() {
  return (
    <NextStudio config={config} />
  );
}
