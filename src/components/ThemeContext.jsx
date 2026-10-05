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
  LAST_THEME_KEY,
  nextThemeAfter,
  normalizeThemeDefinition,
  pickRandomTheme,
  resolveThemeDefinition
} from '@/lib/themes';

export const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  colors: DEFAULT_THEME.colors,
  overrideTheme: () => {},
  restartTheme: () => {},
  nextTheme: () => {},
  isResolving: false
});

export function ThemeProvider({ children, initialThemes }) {
  const availableThemes = useMemo(
    () => (initialThemes || []).map(normalizeThemeDefinition).filter(Boolean),
    [initialThemes]
  );
  // The layout's inline script painted its pick before hydration: start from it,
  // with no image wait and no second pick. Nothing renders markup from the theme,
  // so the server's default can't mismatch.
  const [theme, setTheme] = useState(() => {
    const painted =
      typeof document !== 'undefined' &&
      availableThemes[document.documentElement.dataset.theme];
    return painted
      ? { ...painted, source: 'cms', status: 'ready' }
      : DEFAULT_THEME;
  });
  const [requestedTheme, setRequestedTheme] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const themeCacheRef = useRef(new Map());
  const hasRequestedInitialTheme = useRef(theme !== DEFAULT_THEME);

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

    setIsResolving(true);
    setRequestedTheme(normalizedTheme);
  }, []);

  const overrideTheme = useCallback(
    (nextTheme) => {
      requestTheme(nextTheme);
    },
    [requestTheme]
  );

  const restartTheme = useCallback(() => {
    const randomTheme = pickRandomTheme(availableThemes, theme.url);

    if (randomTheme) {
      requestTheme(randomTheme);
    }
  }, [availableThemes, requestTheme, theme.url]);

  const nextTheme = useCallback(() => {
    const next = nextThemeAfter(availableThemes, theme.url);

    if (next) {
      requestTheme(next);
    }
  }, [availableThemes, requestTheme, theme.url]);

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

  // The starting default is the stylesheet's; applying it would undo the pick
  // the head script painted.
  useLayoutEffect(() => {
    if (theme === DEFAULT_THEME) return;
    applyThemeToDocument(theme);
    // only a CMS theme can come back on a reload, never a visitor's photo
    if (!availableThemes.some(({ url }) => url === theme.url)) return;
    try {
      localStorage.setItem(LAST_THEME_KEY, theme.url);
    } catch {}
  }, [theme, availableThemes]);

  // A visitor's photo is an object URL; once another theme replaces it, nothing reads it again.
  const themeUrl = theme.url;
  useEffect(
    () => () => {
      if (themeUrl?.startsWith('blob:')) URL.revokeObjectURL(themeUrl);
    },
    [themeUrl]
  );

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
        nextTheme,
        isResolving
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
