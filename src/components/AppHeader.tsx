import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  title?: string;
};

export function AppHeader({ title = 'Consulta NF-e' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, contadores } = useAuth();
  const navigate = useNavigate();

  const userLabel = contadores[0]?.nome ?? 'Contador';

  return (
    <header className="app-header">
      <div className="app-header__left">
        <span className="app-header__logo" aria-hidden />
        <span className="app-header__brand">Azoup</span>
        <span className="app-header__title">{title}</span>
      </div>

      <div className="app-header__right">
        <span className="app-header__user" title={userLabel}>
          {userLabel}
        </span>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme.isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <button
          type="button"
          className="btn btn--ghost app-header__logout"
          onClick={() => void signOut().then(() => navigate('/login', { replace: true }))}
          aria-label="Sair"
        >
          <LogOut size={22} />
          <span className="app-header__logout-text">Sair</span>
        </button>
      </div>
    </header>
  );
}
