import { httpClient } from "@/core/api/httpClient";

const baseUrl = "/api/system-config";

export interface ClaimType {
  claimTypeId: number;
  claimTypeCode: string;
  claimTypeName: string;
  claimTypeDescription?: string | null;
}

export interface UpsertClaimTypeRequest {
  claimTypeCode: string;
  claimTypeName: string;
  claimTypeDescription?: string | null;
}

export interface ClaimStatus {
  claimStatusId: number;
  statusCode: string;
  statusName: string;
  sequenceNo: number;
  isTerminalStatus: boolean;
}

export interface UpsertClaimStatusRequest {
  statusCode: string;
  statusName: string;
  sequenceNo: number;
  isTerminalStatus: boolean;
}

export interface InsuranceProduct {
  policyTypeId: number;
  policyTypeCode: string;
  policyTypeName: string;
  policyTypeDescription?: string | null;
}

export interface UpsertInsuranceProductRequest {
  policyTypeCode: string;
  policyTypeName: string;
  policyTypeDescription?: string | null;
}

export interface FraudRule {
  fraudRuleId: number;
  ruleCode: string;
  ruleName: string;
  ruleWeight: number;
  ruleDefinition?: string | null;
}

export interface UpsertFraudRuleRequest {
  ruleCode: string;
  ruleName: string;
  ruleWeight: number;
  ruleDefinition?: string | null;
}

export interface WorkflowStage {
  workflowStageId: number;
  workflowDefinitionId: number;
  stageCode: string;
  stageName: string;
  stageSequence: number;
  slaInHours?: number | null;
}

export interface UpsertWorkflowStageRequest {
  workflowDefinitionId: number;
  stageCode: string;
  stageName: string;
  stageSequence: number;
  slaInHours?: number | null;
}

export const systemConfigurationApi = {
  getClaimTypes: () => httpClient.get<ClaimType[]>(`${baseUrl}/claim-types`),
  getClaimTypeById: (id: number) => httpClient.get<ClaimType>(`${baseUrl}/claim-types/${id}`),
  createClaimType: (payload: UpsertClaimTypeRequest) => httpClient.post<ClaimType>(`${baseUrl}/claim-types`, payload),
  updateClaimType: (id: number, payload: UpsertClaimTypeRequest) => httpClient.put<ClaimType>(`${baseUrl}/claim-types/${id}`, payload),
  deleteClaimType: (id: number) => httpClient.delete<void>(`${baseUrl}/claim-types/${id}`),

  getClaimStatuses: () => httpClient.get<ClaimStatus[]>(`${baseUrl}/claim-statuses`),
  getClaimStatusById: (id: number) => httpClient.get<ClaimStatus>(`${baseUrl}/claim-statuses/${id}`),
  createClaimStatus: (payload: UpsertClaimStatusRequest) =>
    httpClient.post<ClaimStatus>(`${baseUrl}/claim-statuses`, payload),
  updateClaimStatus: (id: number, payload: UpsertClaimStatusRequest) =>
    httpClient.put<ClaimStatus>(`${baseUrl}/claim-statuses/${id}`, payload),
  deleteClaimStatus: (id: number) => httpClient.delete<void>(`${baseUrl}/claim-statuses/${id}`),

  getInsuranceProducts: () => httpClient.get<InsuranceProduct[]>(`${baseUrl}/insurance-products`),
  getInsuranceProductById: (id: number) => httpClient.get<InsuranceProduct>(`${baseUrl}/insurance-products/${id}`),
  createInsuranceProduct: (payload: UpsertInsuranceProductRequest) =>
    httpClient.post<InsuranceProduct>(`${baseUrl}/insurance-products`, payload),
  updateInsuranceProduct: (id: number, payload: UpsertInsuranceProductRequest) =>
    httpClient.put<InsuranceProduct>(`${baseUrl}/insurance-products/${id}`, payload),
  deleteInsuranceProduct: (id: number) => httpClient.delete<void>(`${baseUrl}/insurance-products/${id}`),

  getFraudRules: () => httpClient.get<FraudRule[]>(`${baseUrl}/fraud-rules`),
  getFraudRuleById: (id: number) => httpClient.get<FraudRule>(`${baseUrl}/fraud-rules/${id}`),
  createFraudRule: (payload: UpsertFraudRuleRequest) => httpClient.post<FraudRule>(`${baseUrl}/fraud-rules`, payload),
  updateFraudRule: (id: number, payload: UpsertFraudRuleRequest) =>
    httpClient.put<FraudRule>(`${baseUrl}/fraud-rules/${id}`, payload),
  deleteFraudRule: (id: number) => httpClient.delete<void>(`${baseUrl}/fraud-rules/${id}`),

  getWorkflowStages: () => httpClient.get<WorkflowStage[]>(`${baseUrl}/workflow-stages`),
  getWorkflowStageById: (id: number) => httpClient.get<WorkflowStage>(`${baseUrl}/workflow-stages/${id}`),
  createWorkflowStage: (payload: UpsertWorkflowStageRequest) =>
    httpClient.post<WorkflowStage>(`${baseUrl}/workflow-stages`, payload),
  updateWorkflowStage: (id: number, payload: UpsertWorkflowStageRequest) =>
    httpClient.put<WorkflowStage>(`${baseUrl}/workflow-stages/${id}`, payload),
  deleteWorkflowStage: (id: number) => httpClient.delete<void>(`${baseUrl}/workflow-stages/${id}`)
};
