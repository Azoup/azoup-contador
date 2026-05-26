import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  title?: string;
};

export function AppHeader({ title = 'Consulta NF-e' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, contadores } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const userLabel = contadores[0]?.nome ?? 'Contador';

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.headerBorder,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.logoDot, { backgroundColor: theme.primary }]} />
        <Text style={[styles.brand, { color: theme.primary }]} numberOfLines={1}>
          Azoup
        </Text>
        {!isMobile && (
          <Text style={[styles.title, { color: theme.textSecondary }]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        {!isMobile && (
          <Text style={[styles.user, { color: theme.textSecondary }]} numberOfLines={1}>
            {userLabel}
          </Text>
        )}
        <Pressable onPress={toggleTheme} style={styles.iconBtn} accessibilityLabel="Alternar tema">
          <Ionicons
            name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={theme.textSecondary}
          />
        </Pressable>
        <Pressable onPress={signOut} style={styles.iconBtn} accessibilityLabel="Sair">
          <Ionicons name="log-out-outline" size={22} color={theme.textSecondary} />
          {!isMobile && (
            <Text style={[styles.sairText, { color: theme.textSecondary }]}>Sair</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      web: { position: 'sticky' as const, top: 0, zIndex: 100 },
      default: {},
    }),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    marginLeft: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  user: {
    fontSize: 13,
    maxWidth: 160,
    marginRight: 8,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  sairText: {
    fontSize: 14,
  },
});
