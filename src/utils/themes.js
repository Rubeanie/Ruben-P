'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePalette } from 'react-palette';
import seedrandom from 'seedrandom';
import Color from 'color';

const FETCH_THEME_EVENT = 'fetchThemeEvent';
const UPDATE_THEME_EVENT = 'updateThemeEvent';

function useTheme(initialThemes) {
  const [url, setUrl] = useState(
    'https://res.cloudinary.com/ruben-p/image/upload/f_avif,q_30,c_limit,w_800/v1645499430/Images/Backgrounds/paolo-celentano-qMjZUL0_pOw-unsplash_jioifq.webp'
  );
  const { data, loading } = usePalette(url);

  const randomTheme = useCallback((themes) => {
    const rng = seedrandom.xor4096();
    const index = Math.floor(rng() * themes.length);
    console.log(`Url: ${themes[index].image} | Index: ${index}`);
    if (themes[index].message) {
      console.log(themes[index].message);
    }
    return themes[index].image;
  }, []);

  useEffect(() => {
    setUrl(randomTheme(initialThemes));

    const handleFetchTheme = (event) => {
      if (event.detail && event.detail.url) {
        setUrl(event.detail.url);
      } else {
        setUrl(randomTheme(initialThemes));
      }
    };

    window.addEventListener(FETCH_THEME_EVENT, handleFetchTheme);
    return () => {
      window.removeEventListener(FETCH_THEME_EVENT, handleFetchTheme);
    };
  }, [initialThemes, randomTheme]);

  const colors = useMemo(() => {
    if (!loading && data) {
      const baseColor = Color(data.darkMuted);
      return {
        primary: Color(data.lightVibrant).hex(),
        secondary: baseColor.saturate(0.25).lighten(0.2).hex(),
        background: baseColor.saturate(0.75).darken(0.55).hex(),
        text: baseColor.saturate(1.3).lighten(2.5).hex()
      };
    }
    return null;
  }, [data, loading]);

  useEffect(() => {
    if (colors) {
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
  const backgroundUrl = useTheme(themes);

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
      <div className='background-image' />
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
