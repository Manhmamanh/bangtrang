import { useState, useEffect, useCallback } from 'react';

export type ThemeType = 'light' | 'dark' | 'system';

interface Theme {
  type: ThemeType;
  isDark: boolean;
}

const STORAGE_KEY = 'tppo-whiteboard-theme';

export function useTheme(): [Theme, (theme: ThemeType) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeType | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return {
        type: stored,
        isDark: getIsDark(stored),
      };
    }

    // Default to system preference
    return {
      type: 'system',
      isDark: getSystemPreference(),
    };
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme.type === 'system') {
        setTheme((prev) => ({
          ...prev,
          isDark: mediaQuery.matches,
        }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.type]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme.isDark;

    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [theme.isDark]);

  const setThemeType = useCallback((newType: ThemeType) => {
    localStorage.setItem(STORAGE_KEY, newType);
    setTheme({
      type: newType,
      isDark: getIsDark(newType),
    });
  }, []);

  return [theme, setThemeType];
}

function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getIsDark(type: ThemeType): boolean {
  if (type === 'system') {
    return getSystemPreference();
  }
  return type === 'dark';
}
