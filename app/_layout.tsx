import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ClientOnly } from '@/components/ClientOnly';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

/** App com login/sessão: renderizar só no cliente (sem SSR). */
export const unstable_settings = {
  render: 'client',
};

function RootStack() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="primeiro-acesso" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClientOnly>
        <AuthProvider>
          <RootStack />
        </AuthProvider>
      </ClientOnly>
    </ThemeProvider>
  );
}
