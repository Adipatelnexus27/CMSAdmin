import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import GppMaybeRoundedIcon from "@mui/icons-material/GppMaybeRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import HistoryEduRoundedIcon from "@mui/icons-material/HistoryEduRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import AutoModeRoundedIcon from "@mui/icons-material/AutoModeRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { ReactNode } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: <DashboardRoundedIcon /> },
  { label: "Claims", to: "/claims", icon: <DescriptionRoundedIcon /> },
  { label: "Claim Registration", to: "/claims/register", icon: <AddCircleRoundedIcon /> },
  { label: "Policy Validation", to: "/policy-validation", icon: <FactCheckRoundedIcon /> },
  { label: "Claim Assignment", to: "/claim-assignment", icon: <AssignmentIndRoundedIcon /> },
  { label: "Claim Investigation", to: "/claim-investigation", icon: <ManageSearchRoundedIcon /> },
  { label: "Fraud Detection", to: "/fraud-detection", icon: <GppMaybeRoundedIcon /> },
  { label: "Coverage Determination", to: "/coverage-determination", icon: <PolicyRoundedIcon /> },
  { label: "Liability Determination", to: "/liability-determination", icon: <BalanceRoundedIcon /> },
  { label: "Claim Reserving", to: "/claim-reserving", icon: <AccountBalanceWalletRoundedIcon /> },
  { label: "Settlement Processing", to: "/settlement-processing", icon: <HandshakeRoundedIcon /> },
  { label: "Payment Management", to: "/payment-management", icon: <PaymentsRoundedIcon /> },
  { label: "Document Management", to: "/document-management", icon: <FolderRoundedIcon /> },
  { label: "Audit Trail", to: "/audit-trail", icon: <HistoryEduRoundedIcon /> },
  { label: "Reporting", to: "/reporting", icon: <AssessmentRoundedIcon /> },
  { label: "Notifications", to: "/notifications", icon: <NotificationsRoundedIcon /> },
  { label: "Workflow Automation", to: "/workflow-automation", icon: <AutoModeRoundedIcon /> }
];

