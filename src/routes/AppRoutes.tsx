import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { DashboardPage } from "../features/auth/pages/DashboardPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ClaimCreatePage } from "../features/claims/pages/ClaimCreatePage";
import { ClaimDetailPage } from "../features/claims/pages/ClaimDetailPage";
import { ClaimListPage } from "../features/claims/pages/ClaimListPage";
import { ClaimTriagePage } from "../features/claims/pages/ClaimTriagePage";
import { SystemConfigurationPage } from "../features/configuration/pages/SystemConfigurationPage";
import { FraudReviewDashboardPage } from "../features/fraud/pages/FraudReviewDashboardPage";
import { InvestigationDashboardPage } from "../features/investigation/pages/InvestigationDashboardPage";
import { ReserveApprovalPage } from "../features/reserve/pages/ReserveApprovalPage";
import { ReserveManagementPage } from "../features/reserve/pages/ReserveManagementPage";

export function AppRoutes() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/claims" element={isAuthenticated ? <ClaimListPage /> : <Navigate to="/login" replace />} />
      <Route path="/claims/triage" element={isAuthenticated ? <ClaimTriagePage /> : <Navigate to="/login" replace />} />
      <Route path="/claims/new" element={isAuthenticated ? <ClaimCreatePage /> : <Navigate to="/login" replace />} />
      <Route path="/claims/:claimId" element={isAuthenticated ? <ClaimDetailPage /> : <Navigate to="/login" replace />} />
      <Route path="/investigations" element={isAuthenticated ? <InvestigationDashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/fraud-review" element={isAuthenticated ? <FraudReviewDashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/reserves" element={isAuthenticated ? <ReserveManagementPage /> : <Navigate to="/login" replace />} />
      <Route path="/reserves/approvals" element={isAuthenticated ? <ReserveApprovalPage /> : <Navigate to="/login" replace />} />
      <Route
        path="/configurations"
        element={isAuthenticated ? <SystemConfigurationPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
