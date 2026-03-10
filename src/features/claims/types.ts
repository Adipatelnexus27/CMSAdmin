export interface CreateClaimRequest {
  policyNumber: string;
  claimType: string;
  reporterName: string;
  incidentDateUtc: string;
  incidentLocation: string;
  incidentDescription: string;
  relatedClaimIds: string[];
}

export interface ClaimSummary {
  claimId: string;
  claimNumber: string;
  policyNumber: string;
  claimType: string;
  claimStatus: string;
  reporterName: string;
  incidentDateUtc: string;
  createdAtUtc: string;
}

export interface ClaimDocument {
  claimDocumentId: string;
  claimId: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAtUtc: string;
}

export interface RelatedClaim {
  claimId: string;
  claimNumber: string;
  claimStatus: string;
}

export interface ClaimDetail {
  claimId: string;
  claimNumber: string;
  policyNumber: string;
  claimType: string;
  claimStatus: string;
  reporterName: string;
  incidentDateUtc: string;
  incidentLocation: string;
  incidentDescription: string;
  createdAtUtc: string;
  documents: ClaimDocument[];
  relatedClaims: RelatedClaim[];
}

export interface UploadClaimDocumentResponse {
  claimDocumentId: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAtUtc: string;
}
