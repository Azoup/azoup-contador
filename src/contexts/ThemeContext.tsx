import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

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

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<'light' | 'dark' | null>(null);

  const isDark = override ? override === 'dark' : systemScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setOverride((prev) => {
          const nextDark = prev ? prev !== 'dark' : systemScheme !== 'dark';
          return nextDark ? 'dark' : 'light';
        }),
    }),
    [theme, systemScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
