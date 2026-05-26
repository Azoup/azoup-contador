import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Index() {
  const { bootstrapped, session, contadores, profileLoading } = useAuth();
  const { theme } = useTheme();

  if (!bootstrapped) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (session && (contadores.length > 0 || profileLoading)) {
    if (profileLoading && contadores.length === 0) {
      return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }
    if (contadores.length > 0) {
      return <Redirect href="/(app)/notas" />;
    }
  }

  if (session && !profileLoading && contadores.length === 0) {
    return <Redirect href="/login?erro=sem_cadastro" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
