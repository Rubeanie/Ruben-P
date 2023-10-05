'use client';

import { useEffect } from "react";
import { useBackgroundColor, useColor } from "../utils/themes";

export default function Client() {
  let color = useColor('--color-primary');
  let backgroundColor = useBackgroundColor();

  useEffect(() => {
    let link = document.querySelector("link[rel='mask-icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'mask-icon';
      link.href = '/pwa/safari-pinned-tab.svg';
      document.head.appendChild(link);
    }
    link.setAttribute('color', color);

    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', backgroundColor);
  }, [color, backgroundColor]);

  return null;
}