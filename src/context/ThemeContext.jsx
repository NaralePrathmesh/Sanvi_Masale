import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { themes, DEFAULT_THEME } from '@/config/themes';

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {} });

/** Applies the chosen theme as <html data-theme="…"> and remembers it in this browser. */
export function ThemeProvider({ children }) {
  const [stored, setTheme] = usePersistentState('theme', DEFAULT_THEME);
  const theme = themes.some((t) => t.id === stored) ? stored : DEFAULT_THEME;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themes.find((t) => t.id === theme).meta);
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
