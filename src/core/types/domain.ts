export type ClaimStatus =
  | "Registered"
  | "PolicyValidated"
  | "Assigned"
  | "InvestigationInProgress"
  | "CoverageAssessed"
  | "LiabilityAssessed"
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

