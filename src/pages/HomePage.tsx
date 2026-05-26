import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

export function HomePage() {
  const { bootstrapped, session, contadores, profileLoading } = useAuth();

  if (!bootstrapped) {
    return <LoadingScreen />;
  }

  if (session && (contadores.length > 0 || profileLoading)) {
    if (profileLoading && contadores.length === 0) {
      return <LoadingScreen message="Carregando perfil…" />;
    }
    if (contadores.length > 0) {
      return <Navigate to="/notas" replace />;
    }
  }

  if (session && !profileLoading && contadores.length === 0) {
    return <Navigate to="/login?erro=sem_cadastro" replace />;
  }

  return <Navigate to="/login" replace />;
}
