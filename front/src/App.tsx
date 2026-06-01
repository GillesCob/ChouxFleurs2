import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PublicRoute } from "@/components/layout/PublicRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import PronosticsPage from "@/pages/pronostics/PronosticsPage";
import ListeNaissancePage from "@/pages/liste-naissance/ListeNaissancePage";
import AdminPage from "@/pages/admin/AdminPage";
import InvitePage from "@/pages/invite/InvitePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/invite/:token" element={<InvitePage />} />

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
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
