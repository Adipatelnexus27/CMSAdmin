export type ReserveHistoryStatus = "PendingApproval" | "Approved" | "Rejected";

export interface ClaimReserve {
  claimReserveId: string;
  claimId: string;
  claimNumber: string;
  currentReserveAmount: number;
  currencyCode: string;
  lastApprovedAtUtc?: string | null;
  lastApprovedByUserId?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ClaimReserveHistory {
  claimReserveHistoryId: string;
  claimReserveId: string;
  claimId: string;
  claimNumber: string;
  actionType: string;
  previousReserveAmount?: number | null;
  requestedReserveAmount: number;
  approvedReserveAmount?: number | null;
  currencyCode: string;
  status: ReserveHistoryStatus;
  reason?: string | null;
  requestedByUserId?: string | null;
  requestedAtUtc: string;
  approvedByUserId?: string | null;
  approvedAtUtc?: string | null;
  approvalNote?: string | null;
}

export interface CreateInitialReserveRequest {
  reserveAmount: number;
  currencyCode: string;
  reason?: string;
}

export interface AdjustReserveRequest {
  reserveAmount: number;
  reason?: string;
}

export interface ReviewReserveRequest {
  approvalNote?: string;
}
