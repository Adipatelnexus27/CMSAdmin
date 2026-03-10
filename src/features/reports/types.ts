export type ReportType = "ClaimsByStatus" | "ClaimsByProduct" | "Fraud" | "InvestigatorPerformance" | "Settlement";

export interface ClaimsByStatusReportRow {
  claimStatus: string;
  claimCount: number;
  percentageOfTotal: number;
}

export interface ClaimsByProductReportRow {
  productCode: string;
  claimCount: number;
  openClaims: number;
  closedClaims: number;
}

export interface FraudReportRow {
  fraudStatus: string;
  flagCount: number;
  duplicateFlags: number;
  suspiciousFlags: number;
  averageSeverityScore: number;
}

export interface InvestigatorPerformanceReportRow {
  investigatorUserId: string;
  investigatorName: string;
  assignedClaims: number;
  closedClaims: number;
  averageInvestigationProgress: number;
  totalNotes: number;
  fraudFlagsOnAssignedClaims: number;
}

export interface SettlementReportRow {
  paymentStatus: string;
  paymentCount: number;
  totalPaymentAmount: number;
  averagePaymentAmount: number;
}
