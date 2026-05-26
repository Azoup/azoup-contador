import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn(
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const CONTADOR_DEFAULT_PASSWORD = env.contadorDefaultPassword;
export const BACKEND_URL = env.backendUrl;
