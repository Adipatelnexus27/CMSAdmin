import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson, uploadMultipart } from "../../../services/http/httpClient";
import { ClaimDetail, ClaimSummary, CreateClaimRequest, UploadClaimDocumentResponse } from "../types";

const base = `${API_BASE_URL}/claims`;

export const claimApi = {
  registerClaim: (request: CreateClaimRequest) =>
    postJson<ClaimSummary, CreateClaimRequest>(`${base}/register`, request),

  getClaims: () =>
    getJson<ClaimSummary[]>(base),

  getClaimDetail: (claimId: string) =>
    getJson<ClaimDetail>(`${base}/${claimId}`),

  uploadClaimDocument: (claimId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return uploadMultipart<UploadClaimDocumentResponse>(`${base}/${claimId}/documents`, formData);
  },

  linkRelatedClaim: (claimId: string, relatedClaimId: string) =>
    postJson<void, object>(`${base}/${claimId}/related/${relatedClaimId}`, {})
};
