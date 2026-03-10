import { API_BASE_URL } from "../../../constants/api";
import { getBlob, getJson } from "../../../services/http/httpClient";
import {
  ClaimsByProductReportRow,
  ClaimsByStatusReportRow,
  FraudReportRow,
  InvestigatorPerformanceReportRow,
  ReportType,
  SettlementReportRow
} from "../types";

const base = `${API_BASE_URL}/reports`;

interface DateFilter {
  fromDateUtc?: string;
  toDateUtc?: string;
}

function buildDateQuery(filter: DateFilter): string {
  const query = new URLSearchParams();
  if (filter.fromDateUtc) {
    query.set("fromDateUtc", filter.fromDateUtc);
  }

  if (filter.toDateUtc) {
    query.set("toDateUtc", filter.toDateUtc);
  }

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const reportApi = {
  getClaimsByStatus: (filter: DateFilter) =>
    getJson<ClaimsByStatusReportRow[]>(`${base}/claims-by-status${buildDateQuery(filter)}`),

  getClaimsByProduct: (filter: DateFilter) =>
    getJson<ClaimsByProductReportRow[]>(`${base}/claims-by-product${buildDateQuery(filter)}`),

  getFraudReport: (filter: DateFilter) =>
    getJson<FraudReportRow[]>(`${base}/fraud${buildDateQuery(filter)}`),

  getInvestigatorPerformance: (filter: DateFilter) =>
    getJson<InvestigatorPerformanceReportRow[]>(`${base}/investigator-performance${buildDateQuery(filter)}`),

  getSettlementReport: (filter: DateFilter) =>
    getJson<SettlementReportRow[]>(`${base}/settlements${buildDateQuery(filter)}`),

  exportExcel: (reportType: ReportType, filter: DateFilter) => {
    const query = new URLSearchParams();
    query.set("reportType", reportType);
    if (filter.fromDateUtc) {
      query.set("fromDateUtc", filter.fromDateUtc);
    }

    if (filter.toDateUtc) {
      query.set("toDateUtc", filter.toDateUtc);
    }

    return getBlob(`${base}/export/excel?${query.toString()}`);
  },

  exportPdf: (reportType: ReportType, filter: DateFilter) => {
    const query = new URLSearchParams();
    query.set("reportType", reportType);
    if (filter.fromDateUtc) {
      query.set("fromDateUtc", filter.fromDateUtc);
    }

    if (filter.toDateUtc) {
      query.set("toDateUtc", filter.toDateUtc);
    }

    return getBlob(`${base}/export/pdf?${query.toString()}`);
  }
};
