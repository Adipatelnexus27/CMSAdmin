import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { auditApi } from "../api/auditApi";
import { AuditEventType, AuditLog, AuditLogFilter, AuditReportSummary } from "../types";

const EVENT_TYPE_OPTIONS: Array<"All" | AuditEventType> = ["All", "UserAction", "ClaimChange", "ApiActivity"];
const OUTCOME_OPTIONS = ["All", "Success", "Failed"] as const;
const TAKE_OPTIONS = [100, 250, 500, 1000];

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function toDateRange(fromDate: string, toDate: string): Pick<AuditLogFilter, "fromDateUtc" | "toDateUtc"> {
  return {
    fromDateUtc: fromDate ? `${fromDate}T00:00:00Z` : undefined,
    toDateUtc: toDate ? `${toDate}T23:59:59Z` : undefined
  };
}

export function AuditDashboardPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [report, setReport] = useState<AuditReportSummary>({
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    userActions: 0,
    claimChanges: 0,
    apiActivities: 0,
    distinctUsers: 0,
    distinctClaims: 0
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [eventType, setEventType] = useState<"All" | AuditEventType>("All");
  const [outcome, setOutcome] = useState<typeof OUTCOME_OPTIONS[number]>("All");
  const [actionContains, setActionContains] = useState("");
  const [claimId, setClaimId] = useState("");
  const [userId, setUserId] = useState("");
  const [take, setTake] = useState<number>(250);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filter = useMemo<AuditLogFilter>(() => {
    const baseFilter: AuditLogFilter = {
      ...toDateRange(fromDate, toDate),
      eventType: eventType === "All" ? undefined : eventType,
      isSuccess: outcome === "All" ? undefined : outcome === "Success",
      actionContains: actionContains.trim() || undefined,
      claimId: claimId.trim() || undefined,
      userId: userId.trim() || undefined,
      take
    };

    return baseFilter;
  }, [actionContains, claimId, eventType, fromDate, outcome, take, toDate, userId]);

  useEffect(() => {
    void loadAuditData();
  }, []);

  async function loadAuditData(): Promise<void> {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const [reportResponse, logsResponse] = await Promise.all([
        auditApi.getReportSummary(filter),
        auditApi.getLogs(filter)
      ]);

      setReport(reportResponse);
      setLogs(logsResponse);
      setSuccess("Audit data loaded successfully.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load audit data.");
    } finally {
      setLoading(false);
    }
  }

  async function exportAudit(format: "excel" | "pdf"): Promise<void> {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const blob = format === "excel"
        ? await auditApi.exportExcel(filter)
        : await auditApi.exportPdf(filter);

      const extension = format === "excel" ? "csv" : "pdf";
      downloadBlob(blob, `audit-report-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`);
      setSuccess(`Audit report exported as ${format.toUpperCase()}.`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Unable to export ${format.toUpperCase()} report.`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Audit Trail Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track user actions, claim changes, and API activities.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => void exportAudit("excel")} disabled={loading || exporting}>Export Excel</Button>
            <Button variant="outlined" onClick={() => void exportAudit("pdf")} disabled={loading || exporting}>Export PDF</Button>
            <Button variant="contained" onClick={() => void loadAuditData()} disabled={loading || exporting}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert> : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" }, gap: 1.5, mt: 2 }}>
          <TextField
            label="From Date (UTC)"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date (UTC)"
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Event Type"
            value={eventType}
            onChange={(event) => setEventType(event.target.value as "All" | AuditEventType)}
          >
            {EVENT_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Outcome"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value as typeof OUTCOME_OPTIONS[number])}
          >
            {OUTCOME_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Action Contains"
            value={actionContains}
            onChange={(event) => setActionContains(event.target.value)}
          />
          <TextField
            label="Claim ID"
            value={claimId}
            onChange={(event) => setClaimId(event.target.value)}
          />
          <TextField
            label="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
          <TextField
            select
            label="Rows"
            value={take}
            onChange={(event) => setTake(Number(event.target.value))}
          >
            {TAKE_OPTIONS.map((value) => (
              <MenuItem key={value} value={value}>{value}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Total Events</Typography>
          <Typography variant="h6" fontWeight={700}>{report.totalEvents.toLocaleString()}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Successful</Typography>
          <Typography variant="h6" fontWeight={700}>{report.successfulEvents.toLocaleString()}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Failed</Typography>
          <Typography variant="h6" fontWeight={700}>{report.failedEvents.toLocaleString()}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Distinct Users</Typography>
          <Typography variant="h6" fontWeight={700}>{report.distinctUsers.toLocaleString()}</Typography>
        </Paper>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">User Actions</Typography>
          <Typography variant="h6" fontWeight={700}>{report.userActions.toLocaleString()}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Claim Changes</Typography>
          <Typography variant="h6" fontWeight={700}>{report.claimChanges.toLocaleString()}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">API Activities</Typography>
          <Typography variant="h6" fontWeight={700}>{report.apiActivities.toLocaleString()}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Distinct Claims</Typography>
          <Typography variant="h6" fontWeight={700}>{report.distinctClaims.toLocaleString()}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Audit Events</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Claim</TableCell>
              <TableCell>HTTP</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Success</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.auditLogId}>
                <TableCell>{new Date(log.createdAtUtc).toLocaleString()}</TableCell>
                <TableCell>{log.eventType}</TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{log.actionName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.requestPath ?? "-"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{log.userEmail ?? log.userId ?? "-"}</TableCell>
                <TableCell>{log.claimId ?? "-"}</TableCell>
                <TableCell>{log.httpStatusCode ?? "-"}</TableCell>
                <TableCell>{log.durationMs ?? "-"} ms</TableCell>
                <TableCell>{log.isSuccess ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography variant="body2" color="text.secondary">
                    No audit events found for the selected filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
