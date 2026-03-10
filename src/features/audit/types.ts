export type AuditEventType = "UserAction" | "ClaimChange" | "ApiActivity";

export interface AuditLog {
  auditLogId: string;
  eventType: string;
  actionName: string;
  entityName: string | null;
  entityId: string | null;
  claimId: string | null;
  description: string | null;
  requestMethod: string | null;
  requestPath: string | null;
  requestQuery: string | null;
  httpStatusCode: number | null;
  isSuccess: boolean;
  durationMs: number | null;
  userId: string | null;
  userEmail: string | null;
  userRoleCsv: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  createdAtUtc: string;
}

export interface AuditReportSummary {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  userActions: number;
  claimChanges: number;
  apiActivities: number;
  distinctUsers: number;
  distinctClaims: number;
}

export interface AuditLogFilter {
  fromDateUtc?: string;
  toDateUtc?: string;
  eventType?: string;
  userId?: string;
  claimId?: string;
  isSuccess?: boolean;
  actionContains?: string;
  take?: number;
}

export interface CreateAuditLogRequest {
  eventType: string;
  actionName: string;
  entityName?: string;
  entityId?: string;
  claimId?: string;
  description?: string;
  requestMethod?: string;
  requestPath?: string;
  requestQuery?: string;
  httpStatusCode?: number;
  isSuccess?: boolean;
  durationMs?: number;
  correlationId?: string;
}
