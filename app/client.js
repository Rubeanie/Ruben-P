'use client';

import { useEffect } from "react";
import { useBackgroundColor, useColor } from "./_themes/client";

export default function Client() {
  let color = useColor('--color-primary');
  let backgroundColor = useBackgroundColor();

  useEffect(() => {
    let link = document.querySelector("link[rel='mask-icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'mask-icon';
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