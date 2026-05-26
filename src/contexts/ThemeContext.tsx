import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Theme = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  borderInput: string;
  inputBg: string;
  headerBg: string;
  headerBorder: string;
  success: string;
  error: string;
  isDark: boolean;
};

const lightTheme: Theme = {
  primary: '#FF8B17',
  secondary: '#0F0F41',
  background: '#F7F7F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F0F0',
  text: '#0F0F41',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#EFEFEF',
  borderStrong: '#E0E0E0',
  borderInput: '#E0E0E0',
  inputBg: '#F9F9F9',
  headerBg: '#FFFFFF',
  headerBorder: '#EFEFEF',
  success: '#28A745',
  error: '#DC3545',
  isDark: false,
};

const darkTheme: Theme = {
  primary: '#FF8B17',
  secondary: '#E8E8FF',
  background: '#0D0D1A',
  surface: '#161628',
  surfaceVariant: '#1E1E35',
  text: '#E8E8FF',
  textSecondary: '#9898BB',
  textMuted: '#66667A',
  border: '#2A2A45',
  borderStrong: '#35355A',
  borderInput: '#35355A',
  inputBg: '#1E1E35',
  headerBg: '#161628',
  headerBorder: '#2A2A45',
  success: '#28A745',
  error: '#DC3545',
  isDark: true,
};

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme.isDark ? 'dark' : 'light';
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-surface-variant', theme.surfaceVariant);
  root.style.setProperty('--color-text', theme.text);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-text-muted', theme.textMuted);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-border-strong', theme.borderStrong);
  root.style.setProperty('--color-border-input', theme.borderInput);
  root.style.setProperty('--color-input-bg', theme.inputBg);
  root.style.setProperty('--color-header-bg', theme.headerBg);
  root.style.setProperty('--color-header-border', theme.headerBorder);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-error', theme.error);
}

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'app-contador-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [theme, isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((v) => !v);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
