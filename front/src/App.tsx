import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useInitAuth } from '@/hooks/useInitAuth';
import { ProtectedRoute } from '@/components/layout/protectedRoute';
import { PublicRoute } from '@/components/layout/publicRoute';
import { ScrollToTop } from '@/components/layout/scrollToTop';
import LoginPage from '@/pages/auth/loginPage';
import RegisterPage from '@/pages/auth/registerPage';
import DashboardPage from '@/pages/dashboard/dashboardPage';
import PronosticsPage from '@/pages/pronostics/pronosticsPage';
import ListeNaissancePage from '@/pages/liste-naissance/listeNaissancePage';
import AdminPage from '@/pages/admin/adminPage';
import InvitePage from '@/pages/invite/invitePage';
import AdminInvitePage from '@/pages/invite/adminInvitePage';

export default function App() {
  useInitAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/admin-invite/:token" element={<AdminInvitePage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pronostics" element={<PronosticsPage />} />
          <Route path="/liste-naissance" element={<ListeNaissancePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
