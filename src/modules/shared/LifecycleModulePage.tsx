import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { httpClient } from "@/core/api/httpClient";
import { EntityTable, TableColumn } from "@/core/components/EntityTable";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import { StatusChip } from "@/core/components/StatusChip";
import { WorkItem } from "@/core/types/domain";
import { moduleWorkItems } from "@/modules/shared/mockData";

interface LifecycleModulePageProps {
  title: string;
  description: string;
  endpoint: string;
  sla: string;
}

const columns: TableColumn<WorkItem>[] = [
  { key: "reference", header: "Reference" },
  { key: "owner", header: "Owner" },
  { key: "priority", header: "Priority" },
  { key: "dueDate", header: "Due Date" },
  { key: "status", header: "Status", render: (row) => <StatusChip status={row.status} /> }
];

export function LifecycleModulePage({ title, description, endpoint, sla }: LifecycleModulePageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    setIsSyncing(true);
    try {
      await httpClient.get<unknown>(endpoint);
      setMessage("Live data sync completed.");
    } catch {
      setMessage("Sync endpoint not available. Showing local operational data.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={title}
        subtitle={description}
        endAdornment={
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={syncData} disabled={isSyncing}>
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
        }
      />

      {message ? <Alert severity="info">{message}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                SLA Target
              </Typography>
              <Typography variant="h6">{sla}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Open Work Items
              </Typography>
              <Typography variant="h6">24</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Escalated Cases
              </Typography>
              <Typography variant="h6">5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Automation Hit Rate
              </Typography>
              <Typography variant="h6">63%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <EntityTable columns={columns} rows={moduleWorkItems} rowKey={(row) => row.reference} />
    </PageContainer>
  );
}
