import type { Session } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadContadorProfile } from '@/services/contadorProfile';
import { CONTADOR_DEFAULT_PASSWORD, supabase } from '@/services/supabase';
import { isSenhaPadraoInvalida, mapLoginAuthError, SENHA_JA_CRIADA_MSG } from '@/utils/authErrors';
import { withTimeout } from '@/utils/withTimeout';
import type { ClienteAzoup, Contador } from '@/types';

type AuthContextValue = {
  bootstrapped: boolean;
  profileLoading: boolean;
  session: Session | null;
  contadores: Contador[];
  clientes: ClienteAzoup[];
  tenantIds: string[];
  signIn: (email: string, password: string) => Promise<Contador[]>;
  signOut: () => Promise<void>;
  primeiroAcesso: (email: string, novaSenha: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_TIMEOUT_MS = 12000;
const AUTH_TIMEOUT_MS = 25000;

const SEM_CONTADOR_MSG =
  'Nenhum contador ativo encontrado para este e-mail. Verifique o cadastro em Contadores.';

function loginEmailFromSession(session: Session | null, fallback = '') {
  return (session?.user?.email ?? fallback).trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [contadores, setContadores] = useState<Contador[]>([]);
  const [clientes, setClientes] = useState<ClienteAzoup[]>([]);
  const [tenantIds, setTenantIds] = useState<string[]>([]);

  const authMutationRef = useRef(false);
  const profileRequestId = useRef(0);

  const loadProfileForSession = useCallback(
    async (
      current: Session | null,
      fallbackEmail = '',
      options?: { throwIfEmpty?: boolean }
    ) => {
      if (!current?.user) {
        setContadores([]);
        setClientes([]);
        setTenantIds([]);
        return { contadores: [], clientes: [], tenantIds: [] as string[] };
      }

      const email = loginEmailFromSession(current, fallbackEmail);
      const requestId = ++profileRequestId.current;
      setProfileLoading(true);

      try {
        const profile = await withTimeout(
          loadContadorProfile(email),
          PROFILE_TIMEOUT_MS
        );

        if (requestId !== profileRequestId.current) {
          return profile;
        }

        setContadores(profile.contadores);
        setClientes(profile.clientes);
        setTenantIds(profile.tenantIds);

        if (options?.throwIfEmpty && !profile.contadores.length) {
          throw new Error(SEM_CONTADOR_MSG);
        }

        return profile;
      } catch (e) {
        if (requestId === profileRequestId.current) {
          setContadores([]);
          setClientes([]);
          setTenantIds([]);
        }
        if (options?.throwIfEmpty) throw e;
        return { contadores: [], clientes: [], tenantIds: [] as string[] };
      } finally {
        if (requestId === profileRequestId.current) {
          setProfileLoading(false);
        }
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (authMutationRef.current || !session?.user) return;
    const email = loginEmailFromSession(session);
    await loadProfileForSession(
      { ...session, user: session.user },
      email,
      { throwIfEmpty: false }
    );
  }, [session, loadProfileForSession]);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') {
        setSession(nextSession);
        setBootstrapped(true);

        if (!nextSession?.user) {
          setProfileLoading(false);
          return;
        }

        void loadProfileForSession(nextSession, '', { throwIfEmpty: false });
        return;
      }

      if (authMutationRef.current) return;

      setSession(nextSession);

      if (!nextSession?.user) {
        profileRequestId.current += 1;
        setContadores([]);
        setClientes([]);
        setTenantIds([]);
        setProfileLoading(false);
        return;
      }

      setTimeout(() => {
        if (!mounted || authMutationRef.current) return;
        void loadProfileForSession(nextSession, '', { throwIfEmpty: false });
      }, 0);
    });

    const bootstrapFallback = setTimeout(() => {
      if (mounted) setBootstrapped(true);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(bootstrapFallback);
      subscription.unsubscribe();
    };
  }, [loadProfileForSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      authMutationRef.current = true;
      try {
        const normalizedEmail = email.trim().toLowerCase();

        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          }),
          AUTH_TIMEOUT_MS
        );

        if (error) {
          throw new Error(mapLoginAuthError(error));
        }

        const current = data.session;
        if (!current?.user) {
          throw new Error('Sessão não iniciada.');
        }

        try {
          const profile = await loadProfileForSession(current, normalizedEmail, {
            throwIfEmpty: true,
          });
          setSession(current);
          return profile.contadores;
        } catch (e) {
          await supabase.auth.signOut();
          setSession(null);
          throw e;
        }
      } finally {
        authMutationRef.current = false;
      }
    },
    [loadProfileForSession]
  );

  const signOut = useCallback(async () => {
    authMutationRef.current = true;
    try {
      profileRequestId.current += 1;
      await supabase.auth.signOut();
      setSession(null);
      setContadores([]);
      setClientes([]);
      setTenantIds([]);
    } finally {
      authMutationRef.current = false;
      setProfileLoading(false);
    }
  }, []);

  const primeiroAcesso = useCallback(
    async (email: string, novaSenha: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      authMutationRef.current = true;

      try {
        const { data: signInData, error: signInError } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: CONTADOR_DEFAULT_PASSWORD,
          }),
          AUTH_TIMEOUT_MS
        );

        if (signInError) {
          if (isSenhaPadraoInvalida(signInError)) {
            throw new Error(SENHA_JA_CRIADA_MSG);
          }
          throw signInError;
        }

        let current = signInData.session;
        if (!current?.user) {
          throw new Error(SENHA_JA_CRIADA_MSG);
        }

        const { data: updateData, error: updateError } = await withTimeout(
          supabase.auth.updateUser({ password: novaSenha }),
          AUTH_TIMEOUT_MS
        );

        if (updateError) {
          await supabase.auth.signOut();
          throw new Error(updateError.message || 'Não foi possível definir a nova senha.');
        }

        if (updateData.user) {
          current = { ...current, user: updateData.user };
        }

        try {
          await loadProfileForSession(current, normalizedEmail, { throwIfEmpty: true });
          setSession(current);
        } catch (e) {
          await supabase.auth.signOut();
          setSession(null);
          throw e;
        }
      } finally {
        authMutationRef.current = false;
      }
    },
    [loadProfileForSession]
  );

  const value = useMemo(
    () => ({
      bootstrapped,
      profileLoading,
      session,
      contadores,
      clientes,
      tenantIds,
      signIn,
      signOut,
      primeiroAcesso,
      refreshProfile,
    }),
    [
      bootstrapped,
      profileLoading,
      session,
      contadores,
      clientes,
      tenantIds,
      signIn,
      signOut,
      primeiroAcesso,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
