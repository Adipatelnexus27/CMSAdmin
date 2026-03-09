import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Button } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Link as RouterLink } from "react-router-dom";
import { ClaimListItem, claimsApi } from "@/modules/claims/api/claimsApi";
import { EntityTable, TableColumn } from "@/core/components/EntityTable";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import { StatusChip } from "@/core/components/StatusChip";

const columns: TableColumn<ClaimListItem>[] = [
  { key: "claimId", header: "Claim ID" },
  { key: "claimNumber", header: "Claim Number" },
  { key: "policyNumber", header: "Policy Number" },
  { key: "claimantName", header: "Claimant" },
  { key: "lossDateUtc", header: "Loss Date", render: (row) => new Date(row.lossDateUtc).toLocaleDateString() },
  { key: "statusName", header: "Status", render: (row) => <StatusChip status={row.statusName} /> },
  { key: "estimatedLossAmount", header: "Est. Loss", render: (row) => `$${row.estimatedLossAmount.toLocaleString()}` },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <Button
        component={RouterLink}
        to={`/claims/${row.claimId}`}
        size="small"
        startIcon={<VisibilityRoundedIcon />}
        variant="text"
      >
        View
      </Button>
    )
  }
];

export function ClaimsListPage() {
  const [rows, setRows] = useState<ClaimListItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshFromApi = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await claimsApi.list();
      setRows(data);
      setMessage("Claims synced from backend API.");
    } catch {
      setMessage("Backend not reachable. No claim records available.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFromApi();
  }, [refreshFromApi]);

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
      <EntityTable columns={columns} rows={rows} rowKey={(row) => String(row.claimId)} />
    </PageContainer>
  );
}
