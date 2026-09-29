// The large card every platform takes, 1.91:1.
export const W = 1200;
export const H = 630;
export const SHARE_IMAGE = { width: W, height: H, type: 'image/jpeg' };

export const X = 80;
export const COPY_TOP = 76;
export const COPY_WIDTH = 740;
export const PATH_SIZE = 32;
export const TITLE_SIZE = 64;
export const DESCRIPTION_SIZE = 32;
export const FACTS_SIZE = 28;
export const FACTS_BOTTOM = 60;
export const LOGO_SIZE = 64;

// Path, description and facts are the text colour at this opacity.
export const MUTED = 0.62;

// The rings centre on the site logo in the bottom-right corner.
export const LOGO_CENTRE = {
  cx: W - X - LOGO_SIZE / 2,
  cy: H - FACTS_BOTTOM - LOGO_SIZE / 2
};

// The facts row runs up to the logo.
export const FACTS_WIDTH = W - X * 2 - LOGO_SIZE - 40;
