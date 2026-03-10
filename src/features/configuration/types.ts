export type LookupConfigType = "InsuranceProduct" | "PolicyType" | "ClaimType" | "ClaimStatus";

export interface LookupConfigurationItem {
  configurationItemId: string;
  configType: LookupConfigType;
  name: string;
  code: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UpsertLookupConfigurationItemRequest {
  name: string;
  code: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FraudDetectionRule {
  fraudRuleId: string;
  ruleName: string;
  ruleExpression: string;
  severityScore: number;
  priority: number;
  isActive: boolean;
}

export interface UpsertFraudDetectionRuleRequest {
  ruleName: string;
  ruleExpression: string;
  severityScore: number;
  priority: number;
  isActive: boolean;
}

export interface WorkflowSetting {
  workflowSettingId: string;
  workflowKey: string;
  stepName: string;
  stepSequence: number;
  assignedRole: string;
  slaHours: number;
  isActive: boolean;
}

export interface UpsertWorkflowSettingRequest {
  workflowKey: string;
  stepName: string;
  stepSequence: number;
  assignedRole: string;
  slaHours: number;
  isActive: boolean;
}
