import {
  Alert,
  Box,
  Button,
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
import { useNavigate } from "react-router-dom";
import { reportApi } from "../api/reportApi";
import {
  ClaimsByProductReportRow,
  ClaimsByStatusReportRow,
  FraudReportRow,
  InvestigatorPerformanceReportRow,
  ReportType,
  SettlementReportRow
} from "../types";

interface BarItem {
  label: string;
  value: number;
  helper?: string;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function renderBarRows(items: BarItem[], color: string) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <Stack spacing={1}>
      {items.map((item) => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {item.value.toLocaleString()}
              {item.helper ? ` (${item.helper})` : ""}
            </Typography>
          </Stack>
          <Box sx={{ mt: 0.5, backgroundColor: "grey.200", borderRadius: 1, overflow: "hidden" }}>
            <Box
              sx={{
                height: 10,
                width: `${Math.max(4, Math.round((item.value / maxValue) * 100))}%`,
                backgroundColor: color
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export function ReportingAnalyticsPage() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [claimsByStatus, setClaimsByStatus] = useState<ClaimsByStatusReportRow[]>([]);
  const [claimsByProduct, setClaimsByProduct] = useState<ClaimsByProductReportRow[]>([]);
  const [fraudReport, setFraudReport] = useState<FraudReportRow[]>([]);
  const [investigatorPerformance, setInvestigatorPerformance] = useState<InvestigatorPerformanceReportRow[]>([]);
  const [settlementReport, setSettlementReport] = useState<SettlementReportRow[]>([]);

  const filters = useMemo(
    () => ({
      fromDateUtc: fromDate ? `${fromDate}T00:00:00Z` : undefined,
      toDateUtc: toDate ? `${toDate}T23:59:59Z` : undefined
    }),
    [fromDate, toDate]
  );

  useEffect(() => {
    void loadReports();
  }, []);

  async function loadReports(): Promise<void> {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const [statusRows, productRows, fraudRows, investigatorRows, settlementRows] = await Promise.all([
        reportApi.getClaimsByStatus(filters),
        reportApi.getClaimsByProduct(filters),
        reportApi.getFraudReport(filters),
        reportApi.getInvestigatorPerformance(filters),
        reportApi.getSettlementReport(filters)
      ]);

      setClaimsByStatus(statusRows);
      setClaimsByProduct(productRows);
      setFraudReport(fraudRows);
      setInvestigatorPerformance(investigatorRows);
      setSettlementReport(settlementRows);
      setSuccess("Reporting analytics loaded successfully.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load reporting analytics.");
    } finally {
      setLoading(false);
    }
  }

  async function exportReport(reportType: ReportType, format: "excel" | "pdf"): Promise<void> {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const blob = format === "excel"
        ? await reportApi.exportExcel(reportType, filters)
        : await reportApi.exportPdf(reportType, filters);

      const extension = format === "excel" ? "csv" : "pdf";
      downloadBlob(blob, `report-${reportType}-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`);
      setSuccess(`${reportType} exported as ${format.toUpperCase()}.`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : `Unable to export ${reportType}.`);
    } finally {
      setExporting(false);
    }
  }

  const statusBars: BarItem[] = claimsByStatus.map((row) => ({
    label: row.claimStatus,
    value: row.claimCount,
    helper: `${row.percentageOfTotal.toFixed(2)}%`
  }));

  const productBars: BarItem[] = claimsByProduct.map((row) => ({
    label: row.productCode,
    value: row.claimCount,
    helper: `Open ${row.openClaims} / Closed ${row.closedClaims}`
  }));

  const fraudBars: BarItem[] = fraudReport.map((row) => ({
    label: row.fraudStatus,
    value: row.flagCount,
    helper: `Avg Sev ${row.averageSeverityScore.toFixed(2)}`
  }));

  const investigatorBars: BarItem[] = investigatorPerformance.map((row) => ({
    label: row.investigatorName,
    value: row.assignedClaims,
    helper: `Closed ${row.closedClaims}`
  }));

  const settlementBars: BarItem[] = settlementReport.map((row) => ({
    label: row.paymentStatus,
    value: row.paymentCount,
    helper: `Total ${row.totalPaymentAmount.toFixed(2)}`
  }));

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Reporting & Analytics</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/")}>Dashboard</Button>
            <Button variant="outlined" onClick={() => navigate("/claims")}>Claims</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
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
            <Button variant="contained" onClick={() => void loadReports()} disabled={loading || exporting}>
              {loading ? "Loading..." : "Refresh Reports"}
            </Button>
          </Stack>
        </Paper>

        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Claims By Status</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => void exportReport("ClaimsByStatus", "excel")} disabled={exporting}>Excel</Button>
                <Button size="small" onClick={() => void exportReport("ClaimsByStatus", "pdf")} disabled={exporting}>PDF</Button>
              </Stack>
            </Stack>
            {renderBarRows(statusBars, "#1565C0")}
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Claims</TableCell>
                  <TableCell>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimsByStatus.map((row) => (
                  <TableRow key={row.claimStatus}>
                    <TableCell>{row.claimStatus}</TableCell>
                    <TableCell>{row.claimCount}</TableCell>
                    <TableCell>{row.percentageOfTotal.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Claims By Product</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => void exportReport("ClaimsByProduct", "excel")} disabled={exporting}>Excel</Button>
                <Button size="small" onClick={() => void exportReport("ClaimsByProduct", "pdf")} disabled={exporting}>PDF</Button>
              </Stack>
            </Stack>
            {renderBarRows(productBars, "#2E7D32")}
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Claims</TableCell>
                  <TableCell>Open</TableCell>
                  <TableCell>Closed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimsByProduct.map((row) => (
                  <TableRow key={row.productCode}>
                    <TableCell>{row.productCode}</TableCell>
                    <TableCell>{row.claimCount}</TableCell>
                    <TableCell>{row.openClaims}</TableCell>
                    <TableCell>{row.closedClaims}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Fraud Reports</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => void exportReport("Fraud", "excel")} disabled={exporting}>Excel</Button>
                <Button size="small" onClick={() => void exportReport("Fraud", "pdf")} disabled={exporting}>PDF</Button>
              </Stack>
            </Stack>
            {renderBarRows(fraudBars, "#C62828")}
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Flags</TableCell>
                  <TableCell>Duplicate</TableCell>
                  <TableCell>Suspicious</TableCell>
                  <TableCell>Avg Severity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fraudReport.map((row) => (
                  <TableRow key={row.fraudStatus}>
                    <TableCell>{row.fraudStatus}</TableCell>
                    <TableCell>{row.flagCount}</TableCell>
                    <TableCell>{row.duplicateFlags}</TableCell>
                    <TableCell>{row.suspiciousFlags}</TableCell>
                    <TableCell>{row.averageSeverityScore.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Investigator Performance</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => void exportReport("InvestigatorPerformance", "excel")} disabled={exporting}>Excel</Button>
                <Button size="small" onClick={() => void exportReport("InvestigatorPerformance", "pdf")} disabled={exporting}>PDF</Button>
              </Stack>
            </Stack>
            {renderBarRows(investigatorBars, "#6A1B9A")}
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Investigator</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Closed</TableCell>
                  <TableCell>Avg Progress</TableCell>
                  <TableCell>Total Notes</TableCell>
                  <TableCell>Fraud Flags</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investigatorPerformance.map((row) => (
                  <TableRow key={row.investigatorUserId}>
                    <TableCell>{row.investigatorName}</TableCell>
                    <TableCell>{row.assignedClaims}</TableCell>
                    <TableCell>{row.closedClaims}</TableCell>
                    <TableCell>{row.averageInvestigationProgress.toFixed(2)}%</TableCell>
                    <TableCell>{row.totalNotes}</TableCell>
                    <TableCell>{row.fraudFlagsOnAssignedClaims}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Settlement Reports</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => void exportReport("Settlement", "excel")} disabled={exporting}>Excel</Button>
                <Button size="small" onClick={() => void exportReport("Settlement", "pdf")} disabled={exporting}>PDF</Button>
              </Stack>
            </Stack>
            {renderBarRows(settlementBars, "#EF6C00")}
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Average Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settlementReport.map((row) => (
                  <TableRow key={row.paymentStatus}>
                    <TableCell>{row.paymentStatus}</TableCell>
                    <TableCell>{row.paymentCount}</TableCell>
                    <TableCell>{row.totalPaymentAmount.toFixed(2)}</TableCell>
                    <TableCell>{row.averagePaymentAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}
