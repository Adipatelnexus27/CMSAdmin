export type ClaimStatus =
  | "New"
  | "Triage"
  | "Registered"
  | "PolicyValidated"
  | "Assigned"
  | "Investigation"
  | "InvestigationInProgress"
  | "Coverage Review"
  | "Liability Review"
  | "Reserve Created"
  | "Fraud Check"
  | "CoverageAssessed"
  | "LiabilityAssessed"
  | "Settlement"
  | "Payment"
  | "Reserved"
  | "SettlementProposed"
  | "Paid"
  | "Closed";

export interface ClaimSummary {
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  lossDate: string;
  status: ClaimStatus;
  reserveAmount: number;
}

export interface WorkItem {
  reference: string;
  owner: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  dueDate: string;
  status: string;
}
