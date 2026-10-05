'use client';

import dynamic from 'next/dynamic';

// Split off so a page downloads only the modules it renders. Still
// server-rendered; loading adds the Suspense boundary that lets the rest of the
// page hydrate first.
export const Bento = dynamic(() => import('./Modules/PostList/Bento'), {
  loading: () => null
});
export const ThemeCycle = dynamic(
  () => import('./Modules/CreativeModule/ThemeCycle'),
  { loading: () => null }
);
export const ThemeImage = dynamic(
  () => import('./Modules/CreativeModule/ThemeImage'),
  { loading: () => null }
);
export const Stage = dynamic(() => import('./Modules/Hero3D/Stage'), {
  loading: () => null
});
export const YouTubeFacade = dynamic(() => import('./RichText/YouTubeFacade'), {
  loading: () => null
});
