import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env'
  );
}

const storage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) =>
          Promise.resolve(
            typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
          ),
        setItem: (key: string, value: string) => {
          if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
          return Promise.resolve();
        },
      }
    : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export const CONTADOR_DEFAULT_PASSWORD =
  process.env.EXPO_PUBLIC_CONTADOR_DEFAULT_PASSWORD ?? 'ZPFsistemas';

export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
