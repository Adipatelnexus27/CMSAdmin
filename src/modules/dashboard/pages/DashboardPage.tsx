import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import { KpiCard } from "@/core/components/KpiCard";
import { EntityTable, TableColumn } from "@/core/components/EntityTable";
import { StatusChip } from "@/core/components/StatusChip";
import { ClaimSummary } from "@/core/types/domain";
import { claimSummaries } from "@/modules/shared/mockData";

const columns: TableColumn<ClaimSummary>[] = [
  { key: "claimNumber", header: "Claim #" },
  { key: "policyNumber", header: "Policy #" },
  { key: "claimantName", header: "Claimant" },
  { key: "lossDate", header: "Loss Date" },
  { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> },
  { key: "reserveAmount", header: "Reserve", render: (row) => `$${row.reserveAmount.toLocaleString()}` }
];

export function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Claims Operations Dashboard"
        subtitle="Enterprise view of intake, processing efficiency, fraud exposure, and payment outcomes."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Open Claims" value="1,284" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Claims in SLA Breach Risk" value="87" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Fraud Alerts (30d)" value="124" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Payments Processed (MTD)" value="$3.2M" />
        </Grid>
      </Grid>

      <Stack direction={{ xs: "column", lg: "row" }} gap={2}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Claims
            </Typography>
            <EntityTable columns={columns} rows={claimSummaries} rowKey={(row) => row.claimNumber} />
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Operations Highlights
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              92% first-touch policy validation success in the last 7 days.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Settlement cycle time reduced from 16.2 to 13.8 days quarter-over-quarter.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment exception queue is within threshold with 9 unresolved transactions.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}
