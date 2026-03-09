import { httpClient } from "@/core/api/httpClient";

export interface CreateClaimRequest {
  policyNumber: string;
  claimTypeId: number;
  lossDateUtc: string;
  incidentDescription?: string;
  locationOfLoss?: string;
  estimatedLossAmount: number;
  claimantName: string;
  claimantContactNo?: string;
  claimantEmail?: string;
  claimantAddressLine?: string;
  claimantCity?: string;
  claimantState?: string;
  claimantPostalCode?: string;
  relatedClaimIds: number[];
}

export interface ClaimListItem {
  claimId: number;
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  lossDateUtc: string;
  reportedDateUtc: string;
  statusName: string;
  estimatedLossAmount: number;
}

export interface ClaimDocument {
  claimDocumentId: number;
  documentTypeId: number;
  fileName: string;
  filePath: string;
  uploadedDateUtc: string;
  versionNo: number;
}

export interface RelatedClaim {
  claimId: number;
  claimNumber: string;
}

export interface ClaimDetails {
  claimId: number;
  claimNumber: string;
  policyNumber: string;
  claimTypeId: number;
  currentStatusId: number;
  statusName: string;
  lossDateUtc: string;
  reportedDateUtc: string;
  incidentDescription?: string;
  locationOfLoss?: string;
  estimatedLossAmount: number;
  approvedLossAmount?: number;
  isFraudSuspected: boolean;
  claimant?: {
    fullName: string;
    contactNo?: string;
    email?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  documents: ClaimDocument[];
  relatedClaims: RelatedClaim[];
}

export const claimsApi = {
  list: () => httpClient.get<ClaimListItem[]>("/api/claims"),
  getById: (id: number) => httpClient.get<ClaimDetails>(`/api/claims/${id}`),
  create: (payload: CreateClaimRequest) => httpClient.post<ClaimDetails>("/api/claims", payload),
  uploadDocument: (claimId: number, documentTypeId: number, file: File) => {
    const formData = new FormData();
    formData.append("documentTypeId", String(documentTypeId));
    formData.append("file", file);
    return httpClient.post<ClaimDocument>(`/api/claims/${claimId}/documents`, formData);
  },
  linkRelatedClaim: (claimId: number, relatedClaimId: number) =>
    httpClient.post<void>(`/api/claims/${claimId}/related-claims`, { relatedClaimId })
};
