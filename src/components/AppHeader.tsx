import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Props = {
  title?: string;
};

export function AppHeader({ title = 'Consulta NF-e' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, contadores } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const userLabel = contadores[0]?.nome ?? 'Contador';

  return (
    <header className="app-header">
      <div className="app-header__left">
        <span className="app-header__logo" aria-hidden />
        <span className="app-header__brand">Azoup</span>
        {!isMobile && <span className="app-header__title">{title}</span>}
      </div>

      <div className="app-header__right">
        {!isMobile && <span className="app-header__user">{userLabel}</span>}
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
          className="btn btn--ghost"
          onClick={() => void signOut().then(() => navigate('/login', { replace: true }))}
          aria-label="Sair"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <LogOut size={22} />
          {!isMobile && <span style={{ fontSize: 14 }}>Sair</span>}
        </button>
      </div>
    </header>
  );
}
