import { Chip } from "@mui/material";

interface StatusChipProps {
  status: string;
}

const colorMap: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  New: "info",
  Triage: "warning",
  "Coverage Review": "success",
  "Liability Review": "success",
  "Reserve Created": "warning",
  "Fraud Check": "error",
  Settlement: "info",
  Payment: "success",
  Registered: "info",
  PolicyValidated: "success",
  Assigned: "info",
  InvestigationInProgress: "warning",
  CoverageDetermined: "success",
  LiabilityDetermined: "success",
  SettlementProcessed: "info",
  PaymentCompleted: "success",
  CoverageAssessed: "success",
  LiabilityAssessed: "success",
  Reserved: "warning",
  SettlementProposed: "info",
  Paid: "success",
  Closed: "default",
  Open: "info",
  Pending: "warning",
  Failed: "error"
};

export function StatusChip({ status }: StatusChipProps) {
  return <Chip label={status} color={colorMap[status] ?? "default"} size="small" />;
}
