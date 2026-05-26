import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { bootstrapped, session, contadores, profileLoading } = useAuth();

  if (!bootstrapped) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading && contadores.length === 0) {
    return <LoadingScreen message="Carregando perfil…" />;
  }

  if (!profileLoading && contadores.length === 0) {
    return <Navigate to="/login?erro=sem_cadastro" replace />;
  }

  return <>{children}</>;
}
