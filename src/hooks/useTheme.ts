import { useState, useEffect } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('tinkerings_theme_preference');
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {
      // ignore
    }
    // Default to system
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const systemIsDark = mediaQuery.matches;
      const effectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;
      
      setResolvedTheme(effectiveTheme);

      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    updateTheme();

    // Listen for OS system theme changes
    const handler = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('tinkerings_theme_preference', newTheme);
    } catch {
      // ignore
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
}
