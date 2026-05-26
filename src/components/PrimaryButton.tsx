import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}: Props) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      {...(Platform.OS === 'web' ? { role: 'button' as const } : {})}
      style={({ pressed }) => [
        styles.btn,
        isPrimary
          ? { backgroundColor: theme.primary }
          : {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: theme.borderStrong,
            },
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : theme.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isPrimary ? '#FFFFFF' : theme.text },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.55,
  },
});
