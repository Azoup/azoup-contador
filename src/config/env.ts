function read(key: string): string {
  const vite = import.meta.env[`VITE_${key}` as keyof ImportMetaEnv];
  const expo = import.meta.env[`EXPO_PUBLIC_${key}` as keyof ImportMetaEnv];
  const value = (typeof vite === 'string' ? vite : '') || (typeof expo === 'string' ? expo : '');
  return value.trim();
}

export const env = {
  supabaseUrl: read('SUPABASE_URL'),
  supabaseAnonKey: read('SUPABASE_ANON_KEY'),
  backendUrl: read('BACKEND_URL'),
  contadorDefaultPassword: read('CONTADOR_DEFAULT_PASSWORD') || 'ZPFsistemas',
};
