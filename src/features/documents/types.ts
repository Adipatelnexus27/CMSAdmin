export type DocumentCategory =
  | "General"
  | "Evidence"
  | "AccidentPhoto"
  | "PoliceReport"
  | "MedicalReport"
  | "Invoice"
  | "Settlement";

export interface ClaimDocumentRecord {
  claimDocumentId: string;
  claimId: string;
  originalFileName: string;
  documentCategory: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAtUtc: string;
  documentGroupId: string;
  versionNumber: number;
  isLatest: boolean;
  uploadedByUserId?: string | null;
}

export interface UploadDocumentResponse {
  claimDocumentId: string;
  claimId: string;
  originalFileName: string;
  documentCategory: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAtUtc: string;
  documentGroupId: string;
  versionNumber: number;
  isLatest: boolean;
  uploadedByUserId?: string | null;
}
