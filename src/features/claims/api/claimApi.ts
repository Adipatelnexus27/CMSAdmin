import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson, putJson, uploadMultipart } from "../../../services/http/httpClient";
import {
  AddInvestigatorNoteRequest,
  AssignAdjusterRequest,
  AssignInvestigatorRequest,
  ClaimDetail,
  ClaimInvestigation,
  ClaimSummary,
  CreateClaimRequest,
  SetClaimPriorityRequest,
  UpdateInvestigationProgressRequest,
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

  getInvestigationDashboard: () =>
    getJson<ClaimSummary[]>(`${base}/investigation/dashboard`),

  getClaimDetail: (claimId: string) =>
    getJson<ClaimDetail>(`${base}/${claimId}`),

  getClaimInvestigation: (claimId: string) =>
    getJson<ClaimInvestigation>(`${base}/${claimId}/investigation`),

  uploadClaimDocument: (claimId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return uploadMultipart<UploadClaimDocumentResponse>(`${base}/${claimId}/documents`, formData);
  },

  uploadInvestigationDocument: (claimId: string, file: File, documentCategory: "Evidence" | "AccidentPhoto" | "PoliceReport" | "MedicalReport") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentCategory", documentCategory);

    return uploadMultipart<UploadClaimDocumentResponse>(`${base}/${claimId}/investigation/documents`, formData);
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
    putJson<void, UpdateWorkflowStepRequest>(`${base}/${claimId}/workflow-step`, request),

  addInvestigatorNote: (claimId: string, request: AddInvestigatorNoteRequest) =>
    postJson<void, AddInvestigatorNoteRequest>(`${base}/${claimId}/investigation/notes`, request),

  updateInvestigationProgress: (claimId: string, request: UpdateInvestigationProgressRequest) =>
    putJson<void, UpdateInvestigationProgressRequest>(`${base}/${claimId}/investigation/progress`, request)
};
