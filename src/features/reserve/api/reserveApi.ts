import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson, putJson } from "../../../services/http/httpClient";
import {
  AdjustReserveRequest,
  ClaimReserve,
  ClaimReserveHistory,
  CreateInitialReserveRequest,
  ReserveHistoryStatus,
  ReviewReserveRequest
} from "../types";

const base = `${API_BASE_URL}/claimreserves`;

export const reserveApi = {
  createInitialReserve: (claimId: string, request: CreateInitialReserveRequest) =>
    postJson<ClaimReserve, CreateInitialReserveRequest>(`${base}/claims/${claimId}/initial`, request),

  adjustReserve: (claimId: string, request: AdjustReserveRequest) =>
    postJson<ClaimReserveHistory, AdjustReserveRequest>(`${base}/claims/${claimId}/adjust`, request),

  getClaimReserve: (claimId: string) =>
    getJson<ClaimReserve>(`${base}/claims/${claimId}`),

  getReserveHistory: (claimId: string) =>
    getJson<ClaimReserveHistory[]>(`${base}/claims/${claimId}/history`),

  getApprovalQueue: (status?: ReserveHistoryStatus) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return getJson<ClaimReserveHistory[]>(`${base}/approvals${query}`);
  },

  approveAdjustment: (claimReserveHistoryId: string, request: ReviewReserveRequest) =>
    putJson<void, ReviewReserveRequest>(`${base}/history/${claimReserveHistoryId}/approve`, request),

  rejectAdjustment: (claimReserveHistoryId: string, request: ReviewReserveRequest) =>
    putJson<void, ReviewReserveRequest>(`${base}/history/${claimReserveHistoryId}/reject`, request)
};
