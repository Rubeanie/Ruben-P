'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePalette } from 'react-palette';
import seedrandom from 'seedrandom';
import Color from 'color';
import { useTheme } from '../components/ThemeContext';

const FETCH_THEME_EVENT = 'fetchThemeEvent';
const UPDATE_THEME_EVENT = 'updateThemeEvent';

function useThemeLogic(initialThemes) {
  const { theme, setTheme } = useTheme();
  const [url, setUrl] = useState(theme?.url || '');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { data, loading, error } = usePalette(url);

  const randomTheme = useCallback((themes) => {
    if (!Array.isArray(themes) || themes.length === 0) {
      return '';
    }
    const rng = seedrandom.xor4096();
    const index = Math.floor(rng() * themes.length);
    console.log(`Url: ${themes[index].image} | Index: ${index}`);
    if (themes[index].message) {
      console.log(themes[index].message);
    }
    return themes[index].image;
  }, []);

  useEffect(() => {
    if (initialThemes.length > 0 && !url) {
      const newUrl = randomTheme(initialThemes);
      setUrl(newUrl);
      setTheme({ url: newUrl });
    }
  }, [initialThemes, randomTheme, setTheme, url]);

  useEffect(() => {
    if (url) {
      setIsImageLoaded(false);
      const img = new Image();
      img.onload = () => {
        setIsImageLoaded(true);
      };
      img.onerror = (e) => {
        console.error('Error preloading image:', e);
        setIsImageLoaded(false);
      };
      img.src = url;
    }
  }, [url]);

  const colors = useMemo(() => {
    if (isImageLoaded && !loading && data && Object.keys(data).length > 0) {
      try {
        const baseColor = Color(data.darkMuted);
        return {
          primary: Color(data.lightVibrant).hex(),
          secondary: baseColor.saturate(0.25).lighten(0.2).hex(),
          background: baseColor.saturate(0.75).darken(0.55).hex(),
          text: baseColor.saturate(1.3).lighten(2.5).hex()
        };
      } catch (error) {
        console.error('Error generating colors:', error);
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
      window.dispatchEvent(new Event(UPDATE_THEME_EVENT));
    }
  }, [colors, url]);

  useEffect(() => {
    if (error && isImageLoaded) {
      console.error('Error extracting colors:', error);
    }
  }, [error, isImageLoaded]);

  useEffect(() => {
    const handleFetchTheme = (event) => {
      if (event.detail && event.detail.url) {
        setUrl(event.detail.url);
        setTheme({ url: event.detail.url });
      } else {
        const newUrl = randomTheme(initialThemes);
        setUrl(newUrl);
        setTheme({ url: newUrl });
      }
    };

    window.addEventListener(FETCH_THEME_EVENT, handleFetchTheme);
    return () => {
      window.removeEventListener(FETCH_THEME_EVENT, handleFetchTheme);
    };
  }, [initialThemes, randomTheme, setTheme]);

  return url;
}

export function useCSSVariable(key) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const updateValue = () => {
      const newValue = getComputedStyle(
        document.documentElement
      ).getPropertyValue(key);
      setValue(newValue ? newValue.trim() : null);
    };

    updateValue();
    window.addEventListener(UPDATE_THEME_EVENT, updateValue);
    return () => {
      window.removeEventListener(UPDATE_THEME_EVENT, updateValue);
    };
  }, [key]);

  return value;
}

export function Theme({ themes }) {
  const backgroundUrl = useThemeLogic(themes);

  useEffect(() => {
    window.overrideTheme = (theme) => {
      if (theme) {
        console.log(`Url: ${theme} | Index: OVERRIDE`);
        window.dispatchEvent(
          new CustomEvent(FETCH_THEME_EVENT, { detail: { url: theme } })
        );
      }
    };

    window.restartTheme = () => {
      window.dispatchEvent(new Event(FETCH_THEME_EVENT));
    };
  }, []);

  return (
    <>
      <div
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0
        }}
      />
    </>
  );
}
