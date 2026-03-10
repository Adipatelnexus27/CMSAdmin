import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson, putJson } from "../../../services/http/httpClient";
import { FraudFlag, FraudFlagStatus, RunFraudDetectionResponse, UpdateFraudFlagStatusRequest } from "../types";

const base = `${API_BASE_URL}/fraud`;

export const fraudApi = {
  runDetection: (claimId: string) =>
    postJson<RunFraudDetectionResponse, object>(`${base}/detect/${claimId}`, {}),

  getFlags: (status?: FraudFlagStatus) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return getJson<FraudFlag[]>(`${base}/flags${query}`);
  },

  getClaimFlags: (claimId: string) =>
    getJson<FraudFlag[]>(`${base}/claims/${claimId}/flags`),

  updateFlagStatus: (fraudFlagId: string, request: UpdateFraudFlagStatusRequest) =>
    putJson<void, UpdateFraudFlagStatusRequest>(`${base}/flags/${fraudFlagId}/status`, request)
};
