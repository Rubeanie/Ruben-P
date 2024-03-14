'use client';

import { useEffect } from "react";
import { useBackgroundColor } from "@/utils/themes";

export default function Client() {
  let backgroundColor = useBackgroundColor();

  useEffect(() => {
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', backgroundColor);
  }, [backgroundColor]);

  return null;
}