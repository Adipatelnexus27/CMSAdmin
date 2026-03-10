import { API_BASE_URL } from "../../../constants/api";
import { getBlob, getJson, postJson } from "../../../services/http/httpClient";
import { AuditLog, AuditLogFilter, AuditReportSummary, CreateAuditLogRequest } from "../types";

const base = `${API_BASE_URL}/auditlogs`;

function buildFilterQuery(filter: AuditLogFilter): string {
  const query = new URLSearchParams();

  if (filter.fromDateUtc) {
    query.set("fromDateUtc", filter.fromDateUtc);
  }

  if (filter.toDateUtc) {
    query.set("toDateUtc", filter.toDateUtc);
  }

  if (filter.eventType) {
    query.set("eventType", filter.eventType);
  }

  if (filter.userId) {
    query.set("userId", filter.userId);
  }

  if (filter.claimId) {
    query.set("claimId", filter.claimId);
  }

  if (typeof filter.isSuccess === "boolean") {
    query.set("isSuccess", String(filter.isSuccess));
  }

  if (filter.actionContains) {
    query.set("actionContains", filter.actionContains);
  }

  if (typeof filter.take === "number") {
    query.set("take", String(filter.take));
  }

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const auditApi = {
  logAction: (payload: CreateAuditLogRequest) =>
    postJson<void, CreateAuditLogRequest>(base, payload),

  getLogs: (filter: AuditLogFilter) =>
    getJson<AuditLog[]>(`${base}${buildFilterQuery(filter)}`),

  getReportSummary: (filter: AuditLogFilter) =>
    getJson<AuditReportSummary>(`${base}/report${buildFilterQuery(filter)}`),

  exportExcel: (filter: AuditLogFilter) =>
    getBlob(`${base}/export/excel${buildFilterQuery(filter)}`),

  exportPdf: (filter: AuditLogFilter) =>
    getBlob(`${base}/export/pdf${buildFilterQuery(filter)}`)
};
