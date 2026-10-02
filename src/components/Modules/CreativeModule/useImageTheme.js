'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeContext';
import {
  clampContrast,
  DEFAULT_THEME,
  deriveThemeColorsFromPalette
} from '@/lib/themes';

const LONG_EDGE = 800;
const MAX_BYTES = 100 * 1024 * 1024;

const DECODE_ERROR = 'Couldn’t read that one. Try another photo.';
const SIZE_ERROR = 'That one’s over 100 MB. Try a smaller photo.';

const hasFiles = (event) => event.dataTransfer?.types.includes('Files');

// The palette reads a downsized copy; the page gets the original file, so a GIF
// keeps moving and a PNG keeps its transparency.
async function themeFromFile(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  try {
    const { Vibrant } = await import('node-vibrant/browser');
    const palette = await Vibrant.from(img)
      .maxDimension(LONG_EDGE)
      .getPalette();
    const colors = deriveThemeColorsFromPalette(palette);
    if (colors)
      return { url, colors: clampContrast(colors), source: 'visitor' };
  } catch {
    // a flat or tiny picture has no palette to read
  }
  URL.revokeObjectURL(url);
  return DEFAULT_THEME;
}

// Pick or drop a photo; its palette is read on the device and applied as an override.
export default function useImageTheme() {
  const { theme, overrideTheme, isResolving } = useTheme();
  // 'reading' while the palette is read, 'applying' until the page has it
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const handed = useRef(null);

  // A photo dropped beside the zone would otherwise replace the page with it.
  useEffect(() => {
    const ignore = (event) => {
      if (hasFiles(event)) event.preventDefault();
    };
    window.addEventListener('dragover', ignore);
    window.addEventListener('drop', ignore);
    return () => {
      window.removeEventListener('dragover', ignore);
      window.removeEventListener('drop', ignore);
    };
  }, []);

  if (phase === 'applying' && !isResolving) setPhase(null);
  const busy = Boolean(phase);

  async function take(file) {
    if (!file || busy) return;
    if (file.size > MAX_BYTES) {
      setError(SIZE_ERROR);
      return;
    }
    setError(null);
    setPhase('reading');
    // a photo that never reached the page is not needed any more
    if (handed.current && handed.current !== theme.url)
      URL.revokeObjectURL(handed.current);
    handed.current = null;
    try {
      const next = await themeFromFile(file);
      if (next !== DEFAULT_THEME) handed.current = next.url;
      overrideTheme(next);
      setPhase('applying');
    } catch {
      setError(DECODE_ERROR);
      setPhase(null);
    }
  }

  const zone = {
    onDragEnter(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth.current += 1;
      setDragging(true);
    },
    onDragOver(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave() {
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setDragging(false);
    },
    onDrop(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      take(event.dataTransfer.files?.[0]);
    }
  };

  return {
    busy,
    error,
    // a photo dropped mid-read is ignored, so the zone does not invite one
    dragging: dragging && !busy,
    zone,
    take
  };
}
