export type FraudFlagStatus = "Open" | "UnderInvestigation" | "ConfirmedFraud" | "Cleared";

export interface FraudFlag {
  fraudFlagId: string;
  claimId: string;
  claimNumber: string;
  flagType: string;
  ruleName?: string | null;
  severityScore: number;
  reason: string;
  status: FraudFlagStatus;
  isDuplicate: boolean;
  isSuspicious: boolean;
  createdAtUtc: string;
  createdByUserId?: string | null;
  reviewedByUserId?: string | null;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
}

export interface RunFraudDetectionResponse {
  claimId: string;
  flags: FraudFlag[];
}

export interface UpdateFraudFlagStatusRequest {
  status: FraudFlagStatus;
  reviewNote?: string;
}
