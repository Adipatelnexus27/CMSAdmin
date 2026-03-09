import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Button } from "@mui/material";
import { useState } from "react";
import { claimsApi } from "@/modules/claims/api/claimsApi";
import { EntityTable, TableColumn } from "@/core/components/EntityTable";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import { StatusChip } from "@/core/components/StatusChip";
import { ClaimSummary } from "@/core/types/domain";
import { claimSummaries } from "@/modules/shared/mockData";

const columns: TableColumn<ClaimSummary>[] = [
  { key: "claimNumber", header: "Claim Number" },
  { key: "policyNumber", header: "Policy Number" },
  { key: "claimantName", header: "Claimant" },
  { key: "lossDate", header: "Loss Date" },
  { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
  { key: "reserveAmount", header: "Reserve", render: (row) => `$${row.reserveAmount.toLocaleString()}` }
];

export function ClaimsListPage() {
  const [rows, setRows] = useState<ClaimSummary[]>(claimSummaries);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshFromApi = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await claimsApi.list();
      setRows(data);
      setMessage("Claims synced from backend API.");
    } catch {
      setMessage("Backend not reachable. Showing local sample data.");
      setRows(claimSummaries);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Claims"
        subtitle="Search and monitor claim progression across all lifecycle states."
        endAdornment={
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={refreshFromApi} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        }
      />
      {message ? <Alert severity="info">{message}</Alert> : null}
      <EntityTable columns={columns} rows={rows} rowKey={(row) => row.claimNumber} />
    </PageContainer>
  );
}

