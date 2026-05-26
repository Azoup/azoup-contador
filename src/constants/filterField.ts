import { Platform } from 'react-native';

/** Mesma tipografia dos TextInput do app (login / busca). */
export const FILTER_FONT_FAMILY = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined,
});

export const FILTER_INPUT_HEIGHT = 44;
export const FILTER_FONT_SIZE = 15;
export const FILTER_LABEL_SIZE = 13;
