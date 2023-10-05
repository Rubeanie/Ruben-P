import { prefetchDNS, preconnect } from 'react-dom'

export function Preload() {
  prefetchDNS('https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_wasm_wrapper.js');
  prefetchDNS('https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_decoder.wasm');
  preconnect('https://api.sanity.com', { crossOrigin: 'anonymous' });
  preconnect('https://cdn.sanity.io', { crossOrigin: 'anonymous' });
  preconnect('https://res.cloudinary.com', { crossOrigin: 'anonymous' });
  preconnect('https://www.gstatic.com', { crossOrigin: 'anonymous' });

  return null;
}