import { Alert, Platform } from 'react-native';

/**
 * Alerta multiplataforma — no web o Alert do RN muitas vezes não aparece.
 */
export function showAlert(title: string, message?: string, onOk?: () => void) {
  const text = message ? `${title}\n\n${message}` : title;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(text);
    }
    onOk?.();
    return;
  }

  if (message) {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  } else {
    Alert.alert(title, undefined, [{ text: 'OK', onPress: onOk }]);
  }
}
