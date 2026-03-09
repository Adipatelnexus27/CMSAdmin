import { ClaimSummary, WorkItem } from "@/core/types/domain";

export const claimSummaries: ClaimSummary[] = [
  {
    claimNumber: "CLM-2026-00102",
    policyNumber: "POL-889120",
    claimantName: "John Matthews",
    lossDate: "2026-02-18",
    status: "InvestigationInProgress",
    reserveAmount: 24000
  },
  {
    claimNumber: "CLM-2026-00103",
    policyNumber: "POL-778113",
    claimantName: "Emily Cooper",
    lossDate: "2026-02-20",
    status: "PolicyValidated",
    reserveAmount: 9500
  },
  {
    claimNumber: "CLM-2026-00104",
    policyNumber: "POL-661013",
    claimantName: "Nexa Transport Ltd.",
    lossDate: "2026-02-25",
    status: "SettlementProposed",
    reserveAmount: 54000
  }
];

export const moduleWorkItems: WorkItem[] = [
  {
    reference: "WK-9001",
    owner: "Ajay Sharma",
    priority: "High",
    dueDate: "2026-03-11",
    status: "Pending"
  },
  {
    reference: "WK-9002",
    owner: "Tracy Wilson",
    priority: "Medium",
    dueDate: "2026-03-13",
    status: "Open"
  },
  {
    reference: "WK-9003",
    owner: "Mia Foster",
    priority: "Critical",
    dueDate: "2026-03-10",
    status: "Pending"
  }
];

