import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-mode');
  });

  it('should return default theme as system', () => {
    const { result } = renderHook(() => useTheme());
    const [theme] = result.current;

    expect(theme.type).toBe('system');
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('tppo-whiteboard-theme', 'dark');

    const { result } = renderHook(() => useTheme());
    const [theme] = result.current;

    expect(theme.type).toBe('dark');
    expect(theme.isDark).toBe(true);
  });

  it('should set theme to light', () => {
    const { result } = renderHook(() => useTheme());
    const [, setTheme] = result.current;

    act(() => {
      setTheme('light');
    });

    expect(result.current[0].type).toBe('light');
    expect(result.current[0].isDark).toBe(false);
    expect(localStorage.getItem('tppo-whiteboard-theme')).toBe('light');
  });

  it('should set theme to dark', () => {
    const { result } = renderHook(() => useTheme());
    const [, setTheme] = result.current;

    act(() => {
      setTheme('dark');
    });

    expect(result.current[0].type).toBe('dark');
    expect(result.current[0].isDark).toBe(true);
  });

  it('should apply theme class to DOM', () => {
    const { result } = renderHook(() => useTheme());
    const [, setTheme] = result.current;

    act(() => {
      setTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should remove dark-mode class when switching to light', () => {
    const { result } = renderHook(() => useTheme());
    const [, setTheme] = result.current;

    act(() => {
      setTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);

    act(() => {
      setTheme('light');
    });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
