import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson, putJson, uploadMultipart } from "../../../services/http/httpClient";
import {
  AssignAdjusterRequest,
  AssignInvestigatorRequest,
  ClaimDetail,
  ClaimSummary,
  CreateClaimRequest,
  SetClaimPriorityRequest,
  UpdateClaimStatusRequest,
  UpdateWorkflowStepRequest,
  UploadClaimDocumentResponse
} from "../types";

const base = `${API_BASE_URL}/claims`;

export const claimApi = {
  registerClaim: (request: CreateClaimRequest) =>
    postJson<ClaimSummary, CreateClaimRequest>(`${base}/register`, request),

  getClaims: () =>
    getJson<ClaimSummary[]>(base),

  getAssignedClaims: (assigneeUserId: string, role: "Investigator" | "Adjuster") =>
    getJson<ClaimSummary[]>(`${base}/assigned?assigneeUserId=${encodeURIComponent(assigneeUserId)}&role=${encodeURIComponent(role)}`),

  getClaimDetail: (claimId: string) =>
    getJson<ClaimDetail>(`${base}/${claimId}`),

  uploadClaimDocument: (claimId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return uploadMultipart<UploadClaimDocumentResponse>(`${base}/${claimId}/documents`, formData);
  },

  linkRelatedClaim: (claimId: string, relatedClaimId: string) =>
    postJson<void, object>(`${base}/${claimId}/related/${relatedClaimId}`, {}),

  assignInvestigator: (claimId: string, request: AssignInvestigatorRequest) =>
    putJson<void, AssignInvestigatorRequest>(`${base}/${claimId}/assign/investigator`, request),

  assignAdjuster: (claimId: string, request: AssignAdjusterRequest) =>
    putJson<void, AssignAdjusterRequest>(`${base}/${claimId}/assign/adjuster`, request),

  setPriority: (claimId: string, request: SetClaimPriorityRequest) =>
    putJson<void, SetClaimPriorityRequest>(`${base}/${claimId}/priority`, request),

  updateStatus: (claimId: string, request: UpdateClaimStatusRequest) =>
    putJson<void, UpdateClaimStatusRequest>(`${base}/${claimId}/status`, request),

  updateWorkflowStep: (claimId: string, request: UpdateWorkflowStepRequest) =>
    putJson<void, UpdateWorkflowStepRequest>(`${base}/${claimId}/workflow-step`, request)
};
