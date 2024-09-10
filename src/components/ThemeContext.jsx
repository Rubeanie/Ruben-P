'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../lib/themes';

const ThemeContext = createContext({
  theme: null,
  setTheme: () => {}
});

export function ThemeProvider({ children, initialThemes }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // Load theme from localStorage on initial render
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(JSON.parse(storedTheme));
    } else if (initialThemes && initialThemes.length > 0) {
      // If no stored theme, set a random theme from initialThemes
      const randomTheme =
        initialThemes[Math.floor(Math.random() * initialThemes.length)];
      setTheme({ url: randomTheme.image });
    }
  }, [initialThemes]);

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    if (theme) {
      localStorage.setItem('theme', JSON.stringify(theme));
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
      <Theme themes={initialThemes} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
