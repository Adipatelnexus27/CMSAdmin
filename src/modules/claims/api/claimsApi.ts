import { httpClient } from "@/core/api/httpClient";
import { ClaimSummary } from "@/core/types/domain";

export interface CreateClaimRequest {
  policyNumber: string;
  claimantName: string;
  lossDate: string;
  lossDescription: string;
}

export const claimsApi = {
  list: () => httpClient.get<ClaimSummary[]>("/api/v1/claims"),
  create: (payload: CreateClaimRequest) => httpClient.post<ClaimSummary>("/api/v1/claims", payload)
};

