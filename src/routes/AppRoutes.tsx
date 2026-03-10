import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { DashboardPage } from "../features/auth/pages/DashboardPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SystemConfigurationPage } from "../features/configuration/pages/SystemConfigurationPage";

export function AppRoutes() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route
        path="/configurations"
        element={isAuthenticated ? <SystemConfigurationPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
