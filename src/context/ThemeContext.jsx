import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useStore } from '@/context/StoreContext';
import { themes, DEFAULT_THEME } from '@/config/themes';

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {}, pickerEnabled: true });
const valid = (id) => themes.some((t) => t.id === id);

/**
 * Applies the active theme as <html data-theme="…">.
 * Admin → Settings → Appearance sets the store default and whether visitors may switch;
 * a visitor's own pick (if allowed) is remembered in this browser.
 */
export function ThemeProvider({ children }) {
  const { settings } = useStore();
  const [picked, setTheme] = usePersistentState('theme', null);
  const pickerEnabled = settings.allowThemePicker !== false;
  const storeDefault = valid(settings.defaultTheme) ? settings.defaultTheme : DEFAULT_THEME;
  const theme = pickerEnabled && valid(picked) ? picked : storeDefault;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themes.find((t) => t.id === theme).meta);
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme, pickerEnabled, storeDefault }), [theme, setTheme, pickerEnabled, storeDefault]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
