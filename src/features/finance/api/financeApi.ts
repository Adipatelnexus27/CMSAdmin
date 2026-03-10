import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson, putJson } from "../../../services/http/httpClient";
import {
  CalculateSettlementRequest,
  ClaimPayment,
  ClaimPaymentStatusHistory,
  ClaimSettlement,
  PaymentStatus,
  RequestPaymentApprovalRequest,
  ReviewPaymentRequest,
  UpdatePaymentStatusRequest
} from "../types";

const base = `${API_BASE_URL}/claimsettlements`;

export const financeApi = {
  calculateSettlement: (claimId: string, request: CalculateSettlementRequest) =>
    postJson<ClaimSettlement, CalculateSettlementRequest>(`${base}/claims/${claimId}/calculate`, request),

  getSettlementByClaimId: (claimId: string) =>
    getJson<ClaimSettlement>(`${base}/claims/${claimId}`),

  getClaimPayments: (claimId: string) =>
    getJson<ClaimPayment[]>(`${base}/claims/${claimId}/payments`),

  requestPaymentApproval: (claimSettlementId: string, request: RequestPaymentApprovalRequest) =>
    postJson<ClaimPayment, RequestPaymentApprovalRequest>(`${base}/${claimSettlementId}/payments/request`, request),

  getPayments: (paymentStatus?: PaymentStatus) => {
    const query = paymentStatus ? `?paymentStatus=${encodeURIComponent(paymentStatus)}` : "";
    return getJson<ClaimPayment[]>(`${base}/payments${query}`);
  },

  getPaymentStatusHistory: (claimPaymentId: string) =>
    getJson<ClaimPaymentStatusHistory[]>(`${base}/payments/${claimPaymentId}/history`),

  approvePayment: (claimPaymentId: string, request: ReviewPaymentRequest) =>
    putJson<void, ReviewPaymentRequest>(`${base}/payments/${claimPaymentId}/approve`, request),

  rejectPayment: (claimPaymentId: string, request: ReviewPaymentRequest) =>
    putJson<void, ReviewPaymentRequest>(`${base}/payments/${claimPaymentId}/reject`, request),

  updatePaymentStatus: (claimPaymentId: string, request: UpdatePaymentStatusRequest) =>
    putJson<void, UpdatePaymentStatusRequest>(`${base}/payments/${claimPaymentId}/status`, request)
};
