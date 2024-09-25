'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '@/lib/themes';

export const ThemeContext = createContext({
  theme: null,
  setTheme: () => {},
  overrideTheme: () => {},
  restartTheme: () => {},
  colors: null,
  setColors: () => {}
});

export function ThemeProvider({ children, initialThemes }) {
  const [theme, setTheme] = useState(() => {
    // Always pick a random theme on initial render
    if (initialThemes?.length > 0) {
      const randomTheme =
        initialThemes[Math.floor(Math.random() * initialThemes.length)];
      return { url: randomTheme.image };
    }
    return null;
  });

  const [colors, setColors] = useState(null);

  const overrideTheme = (url) => {
    setTheme({ url });
  };

  const restartTheme = () => {
    if (initialThemes?.length > 0) {
      const randomTheme =
        initialThemes[Math.floor(Math.random() * initialThemes.length)];
      setTheme({ url: randomTheme.image });
    }
  };

  // Expose functions to the window object for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.overrideTheme = overrideTheme;
      window.restartTheme = restartTheme;
    }

    // Cleanup to remove functions when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        window.overrideTheme = undefined;
        window.restartTheme = undefined;
      }
    };
  }, [overrideTheme, restartTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        overrideTheme,
        restartTheme,
        colors,
        setColors
      }}>
      {children}
      <Theme />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}