'use client';

import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';

export function PersonalPhoto() {
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'ruben-p'
    }
  });

  const personalPhoto = cld.image('v1718092032/Images/About/Personal-Photo.webp');

  return (
    <AdvancedImage
      cldImg={personalPhoto}
      plugins={[lazyload(), placeholder({ mode: 'predominant-color' })]}
    />
  );
}
