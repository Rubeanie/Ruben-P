// Fetches the 3D code ahead of the Stage that renders it. Same import as the
// Stage's, so both share one chunk; kept apart so nothing here pulls it in early.
export const warmHero3D = () => import('./Scene').catch(() => {});
