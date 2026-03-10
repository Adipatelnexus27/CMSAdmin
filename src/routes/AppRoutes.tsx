import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { DashboardPage } from "../features/auth/pages/DashboardPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ClaimCreatePage } from "../features/claims/pages/ClaimCreatePage";
import { ClaimDetailPage } from "../features/claims/pages/ClaimDetailPage";
import { ClaimListPage } from "../features/claims/pages/ClaimListPage";
import { ClaimTriagePage } from "../features/claims/pages/ClaimTriagePage";
import { SystemConfigurationPage } from "../features/configuration/pages/SystemConfigurationPage";
import { DocumentManagementPage } from "../features/documents/pages/DocumentManagementPage";
import { SettlementProcessingPage } from "../features/finance/pages/SettlementProcessingPage";
import { FraudReviewDashboardPage } from "../features/fraud/pages/FraudReviewDashboardPage";
import { InvestigationDashboardPage } from "../features/investigation/pages/InvestigationDashboardPage";
import { ReserveApprovalPage } from "../features/reserve/pages/ReserveApprovalPage";
import { ReserveManagementPage } from "../features/reserve/pages/ReserveManagementPage";
import { ReportingAnalyticsPage } from "../features/reports/pages/ReportingAnalyticsPage";
import { UserManagementPage } from "../features/users/pages/UserManagementPage";
import { AdminLayout } from "../layouts/AdminLayout";

export function AppRoutes() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route path="/" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="claims" element={<ClaimListPage />} />
        <Route path="claims/triage" element={<ClaimTriagePage />} />
        <Route path="claims/new" element={<ClaimCreatePage />} />
        <Route path="claims/:claimId" element={<ClaimDetailPage />} />
        <Route path="investigations" element={<InvestigationDashboardPage />} />
        <Route path="documents" element={<DocumentManagementPage />} />
        <Route path="settlements" element={<SettlementProcessingPage />} />
        <Route path="finance" element={<Navigate to="/settlements" replace />} />
        <Route path="fraud-review" element={<FraudReviewDashboardPage />} />
        <Route path="reserves" element={<ReserveManagementPage />} />
        <Route path="reserves/approvals" element={<ReserveApprovalPage />} />
        <Route path="reports" element={<ReportingAnalyticsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="system-configuration" element={<SystemConfigurationPage />} />
        <Route path="configurations" element={<Navigate to="/system-configuration" replace />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
