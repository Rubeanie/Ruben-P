'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  applyThemeToDocument,
  DEFAULT_THEME,
  getThemeCacheKey,
  normalizeThemeDefinition,
  pickRandomTheme,
  resolveThemeDefinition
} from '@/lib/themes';

export const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  colors: DEFAULT_THEME.colors,
  overrideTheme: () => {},
  restartTheme: () => {},
  isResolving: false
});

export function ThemeProvider({ children, initialThemes }) {
  const availableThemes = useMemo(
    () => (initialThemes || []).map(normalizeThemeDefinition).filter(Boolean),
    [initialThemes]
  );
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [requestedTheme, setRequestedTheme] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const themeCacheRef = useRef(new Map());
  const hasRequestedInitialTheme = useRef(false);

  const resolveRequestedTheme = useCallback(async (nextTheme) => {
    const cacheKey = getThemeCacheKey(nextTheme);

    if (!cacheKey) {
      return null;
    }

    const cachedTheme = themeCacheRef.current.get(cacheKey);

    if (cachedTheme) {
      return cachedTheme;
    }

    const themePromise = resolveThemeDefinition(nextTheme)
      .then((resolvedTheme) => {
        themeCacheRef.current.set(cacheKey, resolvedTheme);
        return resolvedTheme;
      })
      .catch((error) => {
        themeCacheRef.current.delete(cacheKey);
        throw error;
      });

    themeCacheRef.current.set(cacheKey, themePromise);

    return themePromise;
  }, []);

  const requestTheme = useCallback((nextTheme) => {
    const normalizedTheme = normalizeThemeDefinition(nextTheme);

    if (!normalizedTheme) {
      return;
    }

    setRequestedTheme(normalizedTheme);
  }, []);

  const overrideTheme = useCallback(
    (nextTheme) => {
      requestTheme(nextTheme);
    },
    [requestTheme]
  );

  const restartTheme = useCallback(() => {
    const randomTheme = pickRandomTheme(availableThemes, theme?.url);

    if (randomTheme) {
      requestTheme(randomTheme);
    }
  }, [availableThemes, requestTheme, theme?.url]);

  useEffect(() => {
    if (hasRequestedInitialTheme.current || availableThemes.length === 0) {
      return;
    }

    hasRequestedInitialTheme.current = true;
    requestTheme(pickRandomTheme(availableThemes));
  }, [availableThemes, requestTheme]);

  useEffect(() => {
    if (!requestedTheme) {
      return;
    }

    let isCancelled = false;

    setIsResolving(true);

    resolveRequestedTheme(requestedTheme)
      .then((resolvedTheme) => {
        if (isCancelled || !resolvedTheme) {
          return;
        }

        setTheme((currentTheme) => {
          const nextThemeKey = getThemeCacheKey(resolvedTheme);
          const currentThemeKey = getThemeCacheKey(currentTheme);

          return nextThemeKey === currentThemeKey
            ? currentTheme
            : resolvedTheme;
        });
      })
      .catch((error) => {
        if (!isCancelled) {
          console.error('Error resolving theme:', error);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsResolving(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [requestedTheme, resolveRequestedTheme]);

  useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.overrideTheme = overrideTheme;
      window.restartTheme = restartTheme;
    }

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
        colors: theme.colors,
        overrideTheme,
        restartTheme,
        isResolving
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
