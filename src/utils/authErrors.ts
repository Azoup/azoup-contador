import type { AuthError } from '@supabase/supabase-js';

export const SENHA_JA_CRIADA_MSG =
  'A senha já foi criada para este usuário. Utilize a tela de login com sua senha atual.';

/** Falha ao entrar com ZPFsistemas no primeiro acesso = senha já alterada. */
export function isSenhaPadraoInvalida(error: AuthError | { message?: string; code?: string }) {
  const msg = (error.message ?? '').toLowerCase();
  const code = String(error.code ?? '').toLowerCase();
  return (
    msg.includes('invalid') ||
    msg.includes('credentials') ||
    code === 'invalid_credentials'
  );
}

/** Mensagem quando falha login normal. */
export function mapLoginAuthError(error: AuthError | Error): string {
  const msg = ('message' in error ? error.message : '').toLowerCase();

  if (msg.includes('invalid') || msg.includes('credentials')) {
    return 'E-mail ou senha incorretos.';
  }

  return error.message || 'Não foi possível entrar.';
}
