export type PaymentStatus = "PendingApproval" | "Approved" | "Rejected" | "Processing" | "Paid" | "Failed";

export interface ClaimSettlement {
  claimSettlementId: string;
  claimId: string;
  claimNumber: string;
  grossLossAmount: number;
  policyLimitAmount: number;
  deductibleAmount: number;
  eligibleAmount: number;
  approvedSettlementAmount: number;
  currencyCode: string;
  calculationStatus: string;
  calculatedByUserId?: string | null;
  calculatedAtUtc: string;
  updatedAtUtc: string;
}

export interface ClaimPayment {
  claimPaymentId: string;
  claimSettlementId: string;
  claimId: string;
  claimNumber: string;
  paymentAmount: number;
  currencyCode: string;
  paymentStatus: PaymentStatus;
  requestNote?: string | null;
  requestedByUserId?: string | null;
  requestedAtUtc: string;
  approvedByUserId?: string | null;
  approvedAtUtc?: string | null;
  approvalNote?: string | null;
  statusNote?: string | null;
  lastStatusUpdatedAtUtc: string;
}

export interface ClaimPaymentStatusHistory {
  claimPaymentStatusHistoryId: string;
  claimPaymentId: string;
  previousStatus: string;
  newStatus: string;
  note?: string | null;
  changedByUserId?: string | null;
  changedAtUtc: string;
}

export interface CalculateSettlementRequest {
  grossLossAmount: number;
  currencyCode: string;
}

export interface RequestPaymentApprovalRequest {
  paymentAmount: number;
  requestNote?: string;
}

export interface ReviewPaymentRequest {
  approvalNote?: string;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
  statusNote?: string;
}
