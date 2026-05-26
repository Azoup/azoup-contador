import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '@/components/FormField';
import { FormMessage } from '@/components/FormMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { TimeoutError } from '@/utils/withTimeout';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const erroParam =
    searchParams.get('erro') === 'sem_cadastro'
      ? 'Sessão ativa, mas nenhum cadastro de contador vinculado foi encontrado.'
      : null;

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFeedback(null);

    if (!email.trim() || !password) {
      setFeedback({ type: 'error', message: 'Informe e-mail e senha.' });
      return;
    }

    try {
      setLoading(true);
      const vinculos = await signIn(email, password);
      if (!vinculos.length) {
        setFeedback({
          type: 'error',
          message: 'Nenhum cadastro de contador ativo vinculado a este e-mail.',
        });
        return;
      }
      navigate('/notas', { replace: true });
    } catch (err) {
      const msg =
        err instanceof TimeoutError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível entrar.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-scroll">
        <header className="auth-header">
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Consulta de NF-e para contadores</p>
        </header>

        <form className="card" onSubmit={handleLogin}>
          {erroParam ? <FormMessage type="error" message={erroParam} /> : null}
          {feedback ? <FormMessage type={feedback.type} message={feedback.message} /> : null}

          <FormField
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <FormField
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <PrimaryButton
            type="submit"
            label={loading ? 'Entrando…' : 'Entrar'}
            loading={loading}
          />

          <div className="btn-row">
            <Link to="/primeiro-acesso" className="btn btn--outline" style={{ textDecoration: 'none' }}>
              Primeiro acesso
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
