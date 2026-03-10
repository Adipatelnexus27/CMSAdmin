import { API_BASE_URL } from "../../../constants/api";
import { getBlob, getJson, uploadMultipart } from "../../../services/http/httpClient";
import { ClaimDocumentRecord, DocumentCategory, UploadDocumentResponse } from "../types";

const base = `${API_BASE_URL}/documents`;

export const documentApi = {
  getClaimDocuments: (claimId: string, latestOnly: boolean) =>
    getJson<ClaimDocumentRecord[]>(`${base}/claims/${claimId}?latestOnly=${latestOnly}`),

  getDocumentById: (documentId: string) =>
    getJson<ClaimDocumentRecord>(`${base}/${documentId}`),

  getDocumentVersions: (documentId: string) =>
    getJson<ClaimDocumentRecord[]>(`${base}/${documentId}/versions`),

  uploadDocument: (
    claimId: string,
    file: File,
    documentCategory: DocumentCategory,
    documentGroupId?: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentCategory", documentCategory);

    if (documentGroupId && documentGroupId.trim().length > 0) {
      formData.append("documentGroupId", documentGroupId.trim());
    }

    return uploadMultipart<UploadDocumentResponse>(`${base}/claims/${claimId}/upload`, formData);
  },

  previewDocument: (documentId: string) =>
    getBlob(`${base}/${documentId}/preview`)
};
