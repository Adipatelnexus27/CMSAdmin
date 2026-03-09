import { httpClient } from "@/core/api/httpClient";

export type ClaimPriority = "Low" | "Medium" | "High" | "Critical";

export interface AssignmentSummary {
  userId: number;
  displayName: string;
  assignedAtUtc: string;
}

export interface ClaimTriageItem {
  claimId: number;
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  lossDateUtc: string;
  statusName: string;
  priority: ClaimPriority;
  estimatedLossAmount: number;
  investigator?: AssignmentSummary;
  adjuster?: AssignmentSummary;
}

export interface AssigneeWorkload {
  userId: number;
  userName: string;
  displayName: string;
  roleCode: string;
  activeAssignments: number;
}

export interface ClaimAssignmentDashboard {
  generatedAtUtc: string;
  triageQueue: ClaimTriageItem[];
  investigators: AssigneeWorkload[];
  adjusters: AssigneeWorkload[];
}

export interface AssignmentResult {
  claimId: number;
  claimNumber: string;
  assignmentRole: string;
  assignedToUserId: number;
  assignedToDisplayName: string;
  assignedAtUtc: string;
  assignedUserWorkload: number;
}

export const claimAssignmentApi = {
  getDashboard: () => httpClient.get<ClaimAssignmentDashboard>("/api/claim-assignments/dashboard"),

  triageClaim: (claimId: number, priority: ClaimPriority, notes?: string) =>
    httpClient.post<void>(`/api/claim-assignments/${claimId}/triage`, { priority, notes }),

  assignInvestigator: (claimId: number, userId?: number, assignmentReason?: string) =>
    httpClient.post<AssignmentResult>(`/api/claim-assignments/${claimId}/assign-investigator`, {
      userId: userId ?? null,
      assignmentReason: assignmentReason ?? null
    }),

  assignAdjuster: (claimId: number, userId?: number, assignmentReason?: string) =>
    httpClient.post<AssignmentResult>(`/api/claim-assignments/${claimId}/assign-adjuster`, {
      userId: userId ?? null,
      assignmentReason: assignmentReason ?? null
    })
};
