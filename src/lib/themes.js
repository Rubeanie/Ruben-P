'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePalette } from 'react-palette';
import Color from 'color';
import { useTheme } from '@/components/ThemeContext';

export function useCSSVariable(key) {
  const { colors, theme } = useTheme();
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (key.startsWith('--color-') && colors) {
      const colorKey = key.replace('--color-', '');
      setValue(colors[colorKey]);
    } else if (key === '--image-background' && theme) {
      setValue(theme.url);
    }
  }, [key, colors, theme]);

  return value;
}

export function Theme() {
  const { theme, setColors } = useTheme();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const url = theme?.url || '';
  const { data, loading, error } = usePalette(url);

  useEffect(() => {
    if (url) {
      setIsImageLoaded(false);
      const img = new Image();
      img.onload = () => setIsImageLoaded(true);
      img.onerror = (e) => {
        console.error('Error loading image:', e);
        setIsImageLoaded(false);
      };
      img.src = url;
    }
  }, [url]);

  const colors = useMemo(() => {
    if (isImageLoaded && !loading && data && Object.keys(data).length > 0) {
      try {
        const baseColor = Color(data.darkMuted || '#000000');
        return {
          primary: Color(data.lightVibrant || '#ffffff').hex(),
          secondary: baseColor.saturate(0.25).lighten(0.2).hex(),
          background: baseColor.saturate(0.75).darken(0.55).hex(),
          text: baseColor.saturate(1.3).lighten(2.5).hex()
        };
      } catch (err) {
        console.error('Error generating colors:', err);
        return null;
      }
    }
    return null;
  }, [data, loading, isImageLoaded]);

  useEffect(() => {
    if (colors && Object.keys(colors).length > 0) {
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
      document.documentElement.style.setProperty(
        '--image-background',
        `url('${url}')`
      );
      setColors(colors);
    }
  }, [colors, url, setColors]);

  useEffect(() => {
    if (error && isImageLoaded) {
      console.error('Error extracting colors:', error);
    }
  }, [error, isImageLoaded]);

  return null;
}
