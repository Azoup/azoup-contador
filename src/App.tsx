import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotasPage } from '@/pages/NotasPage';
import { PrimeiroAcessoPage } from '@/pages/PrimeiroAcessoPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/primeiro-acesso" element={<PrimeiroAcessoPage />} />
          <Route
            path="/notas"
            element={
              <ProtectedRoute>
                <NotasPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
