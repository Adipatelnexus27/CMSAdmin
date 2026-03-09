import { Chip } from "@mui/material";

interface StatusChipProps {
  status: string;
}

const colorMap: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  Registered: "info",
  PolicyValidated: "success",
  Assigned: "info",
  InvestigationInProgress: "warning",
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

