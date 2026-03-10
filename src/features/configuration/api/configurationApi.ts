import { API_BASE_URL } from "../../../constants/api";
import { deleteJson, getJson, postJson, putJson } from "../../../services/http/httpClient";
import {
  FraudDetectionRule,
  LookupConfigurationItem,
  LookupConfigType,
  UpsertFraudDetectionRuleRequest,
  UpsertLookupConfigurationItemRequest,
  UpsertWorkflowSettingRequest,
  WorkflowSetting
} from "../types";

const base = `${API_BASE_URL}/system-configuration`;

export const configurationApi = {
  getLookupItems: (configType: LookupConfigType) =>
    getJson<LookupConfigurationItem[]>(`${base}/lookup/${configType}`),
  createLookupItem: (configType: LookupConfigType, request: UpsertLookupConfigurationItemRequest) =>
    postJson<LookupConfigurationItem, UpsertLookupConfigurationItemRequest>(`${base}/lookup/${configType}`, request),
  updateLookupItem: (configType: LookupConfigType, configurationItemId: string, request: UpsertLookupConfigurationItemRequest) =>
    putJson<LookupConfigurationItem, UpsertLookupConfigurationItemRequest>(`${base}/lookup/${configType}/${configurationItemId}`, request),
  deleteLookupItem: (configurationItemId: string) =>
    deleteJson(`${base}/lookup/${configurationItemId}`),

  getFraudRules: () =>
    getJson<FraudDetectionRule[]>(`${base}/fraud-rules`),
  createFraudRule: (request: UpsertFraudDetectionRuleRequest) =>
    postJson<FraudDetectionRule, UpsertFraudDetectionRuleRequest>(`${base}/fraud-rules`, request),
  updateFraudRule: (fraudRuleId: string, request: UpsertFraudDetectionRuleRequest) =>
    putJson<FraudDetectionRule, UpsertFraudDetectionRuleRequest>(`${base}/fraud-rules/${fraudRuleId}`, request),
  deleteFraudRule: (fraudRuleId: string) =>
    deleteJson(`${base}/fraud-rules/${fraudRuleId}`),

  getWorkflowSettings: () =>
    getJson<WorkflowSetting[]>(`${base}/workflow-settings`),
  createWorkflowSetting: (request: UpsertWorkflowSettingRequest) =>
    postJson<WorkflowSetting, UpsertWorkflowSettingRequest>(`${base}/workflow-settings`, request),
  updateWorkflowSetting: (workflowSettingId: string, request: UpsertWorkflowSettingRequest) =>
    putJson<WorkflowSetting, UpsertWorkflowSettingRequest>(`${base}/workflow-settings/${workflowSettingId}`, request),
  deleteWorkflowSetting: (workflowSettingId: string) =>
    deleteJson(`${base}/workflow-settings/${workflowSettingId}`)
};
