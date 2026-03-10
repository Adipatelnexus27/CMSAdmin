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
  priority: number;
  workflowStep: string;
  investigatorUserId?: string | null;
  adjusterUserId?: string | null;
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
  priority: number;
  workflowStep: string;
  investigatorUserId?: string | null;
  adjusterUserId?: string | null;
  reporterName: string;
  incidentDateUtc: string;
  incidentLocation: string;
  incidentDescription: string;
  createdAtUtc: string;
  documents: ClaimDocument[];
  relatedClaims: RelatedClaim[];
  workflowHistory: ClaimWorkflowHistory[];
}

export interface UploadClaimDocumentResponse {
  claimDocumentId: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAtUtc: string;
}

export interface ClaimWorkflowHistory {
  claimWorkflowHistoryId: string;
  claimId: string;
  actionType: string;
  previousValue?: string | null;
  newValue: string;
  changedByUserId?: string | null;
  changedAtUtc: string;
}

export interface AssignInvestigatorRequest {
  investigatorUserId: string;
}

export interface AssignAdjusterRequest {
  adjusterUserId: string;
}

export interface SetClaimPriorityRequest {
  priority: number;
}

export interface UpdateClaimStatusRequest {
  claimStatus: string;
}

export interface UpdateWorkflowStepRequest {
  workflowStep: string;
}
