'use client';

import Photo from './Photo';

// Marks its box, and the nearest [data-gate] around it, data-loaded once the
// image is in (or has failed), so a CSS intro waits for the picture.
function done({ currentTarget: img }) {
  img.parentElement.dataset.loaded = 'true';
  const gate = img.closest('[data-gate]');
  if (gate) gate.dataset.loaded = 'true';
}

export default function GatedPhoto(props) {
  return <Photo {...props} onLoad={done} onError={done} />;
}
