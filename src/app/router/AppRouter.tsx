import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/core/auth/AuthGuard";
import { AppLayout } from "@/core/layout/AppLayout";
import { LoginPage } from "@/core/auth/LoginPage";
import { RegisterPage } from "@/core/auth/RegisterPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { ClaimsListPage } from "@/modules/claims/pages/ClaimsListPage";
import { ClaimRegistrationPage } from "@/modules/claims/pages/ClaimRegistrationPage";
import { ClaimDetailPage } from "@/modules/claims/pages/ClaimDetailPage";
import { PolicyValidationPage } from "@/modules/policy/pages/PolicyValidationPage";
import { ClaimAssignmentPage } from "@/modules/assignment/pages/ClaimAssignmentPage";
import { ClaimInvestigationPage } from "@/modules/investigation/pages/ClaimInvestigationPage";
import { FraudDetectionPage } from "@/modules/fraud/pages/FraudDetectionPage";
import { CoverageDeterminationPage } from "@/modules/coverage/pages/CoverageDeterminationPage";
import { LiabilityDeterminationPage } from "@/modules/liability/pages/LiabilityDeterminationPage";
import { ClaimReservingPage } from "@/modules/reserving/pages/ClaimReservingPage";
import { SettlementProcessingPage } from "@/modules/settlement/pages/SettlementProcessingPage";
import { PaymentManagementPage } from "@/modules/payment/pages/PaymentManagementPage";
import { DocumentManagementPage } from "@/modules/document/pages/DocumentManagementPage";
import { AuditTrailPage } from "@/modules/audit/pages/AuditTrailPage";
import { ReportingPage } from "@/modules/reporting/pages/ReportingPage";
import { NotificationsPage } from "@/modules/notifications/pages/NotificationsPage";
import { WorkflowAutomationPage } from "@/modules/workflow/pages/WorkflowAutomationPage";
import { SystemConfigurationPage } from "@/modules/system-config/pages/SystemConfigurationPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/claims" element={<ClaimsListPage />} />
          <Route path="/claims/register" element={<ClaimRegistrationPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/policy-validation" element={<PolicyValidationPage />} />
          <Route path="/claim-assignment" element={<ClaimAssignmentPage />} />
          <Route path="/claim-investigation" element={<ClaimInvestigationPage />} />
          <Route path="/fraud-detection" element={<FraudDetectionPage />} />
          <Route path="/coverage-determination" element={<CoverageDeterminationPage />} />
          <Route path="/liability-determination" element={<LiabilityDeterminationPage />} />
          <Route path="/claim-reserving" element={<ClaimReservingPage />} />
          <Route path="/settlement-processing" element={<SettlementProcessingPage />} />
          <Route path="/payment-management" element={<PaymentManagementPage />} />
          <Route path="/document-management" element={<DocumentManagementPage />} />
          <Route path="/audit-trail" element={<AuditTrailPage />} />
          <Route path="/reporting" element={<ReportingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/workflow-automation" element={<WorkflowAutomationPage />} />
          <Route path="/system-configuration" element={<SystemConfigurationPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
