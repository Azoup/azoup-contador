import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '@/components/FormField';
import { FormMessage } from '@/components/FormMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { TimeoutError } from '@/utils/withTimeout';

export function PrimeiroAcessoPage() {
  const { primeiroAcesso } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success' | 'info';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !novaSenha || !confirmar) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    if (novaSenha.length < 6) {
      setFeedback({
        type: 'error',
        message: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    if (novaSenha !== confirmar) {
      setFeedback({ type: 'error', message: 'A confirmação da senha não confere.' });
      return;
    }

    try {
      setLoading(true);
      await primeiroAcesso(email, novaSenha);
      setFeedback({
        type: 'success',
        message: 'Senha definida com sucesso! Redirecionando…',
      });
      setTimeout(() => navigate('/notas', { replace: true }), 600);
    } catch (err) {
      const msg =
        err instanceof TimeoutError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível concluir o cadastro.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-scroll">
        <Link to="/login" className="link-back">
          ← Voltar ao login
        </Link>

        <h1 className="auth-title">Primeiro acesso</h1>
        <p className="auth-subtitle">
          Informe o e-mail cadastrado e defina sua nova senha. O sistema verifica se ainda está
          com a senha padrão antes de permitir a alteração.
        </p>

        <form className="card" onSubmit={handleSubmit}>
          {feedback ? <FormMessage type={feedback.type} message={feedback.message} /> : null}

          <FormField
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="contador@escritorio.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <FormField
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            disabled={loading}
          />

          <FormField
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            disabled={loading}
          />

          <PrimaryButton
            type="submit"
            label={loading ? 'Processando…' : 'Definir senha e entrar'}
            loading={loading}
          />
        </form>
      </div>
    </div>
  );
}
