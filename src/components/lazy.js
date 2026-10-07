'use client';

import { Suspense, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const subscribe = () => () => {};

// Split off so a page downloads only the modules it renders. Still
// server-rendered. Hydrating, a module sits in its own Suspense boundary, so
// the rest of the page needn't wait for its code. Mounted by a client
// navigation it has none, so the navigation waits for the code instead of
// showing the page with an empty gap the module then pushes open.
function lazily(Module) {
  return function Lazily(props) {
    const hydrating = useSyncExternalStore(
      subscribe,
      () => false,
      () => true
    );
    // Fixed at mount: changing the tree's shape would remount the module.
    const [boundary] = useState(hydrating);
    return boundary ? (
      <Suspense>
        <Module {...props} />
      </Suspense>
    ) : (
      <Module {...props} />
    );
  };
}

export const Bento = lazily(dynamic(() => import('./Modules/PostList/Bento')));
export const ThemeCycle = lazily(
  dynamic(() => import('./Modules/CreativeModule/ThemeCycle'))
);
export const ThemeImage = lazily(
  dynamic(() => import('./Modules/CreativeModule/ThemeImage'))
);
export const Stage = lazily(dynamic(() => import('./Modules/Hero3D/Stage')));
export const MediaCarousel = lazily(
  dynamic(() => import('./Modules/MediaCarousel/Carousel'))
);
export const YouTubeFacade = lazily(
  dynamic(() => import('./RichText/YouTubeFacade'))
);
