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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fraudApi } from "../api/fraudApi";
import { FraudFlag, FraudFlagStatus } from "../types";

const STATUS_OPTIONS: Array<"All" | FraudFlagStatus> = ["All", "Open", "UnderInvestigation", "ConfirmedFraud", "Cleared"];

export function FraudReviewDashboardPage() {
  const navigate = useNavigate();

  const [claimId, setClaimId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | FraudFlagStatus>("All");
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadFlags();
  }, [statusFilter]);

  async function loadFlags(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await fraudApi.getFlags(statusFilter === "All" ? undefined : statusFilter);
      setFlags(response);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load fraud flags.");
    } finally {
      setLoading(false);
    }
  }

  async function runDetectionForClaim(): Promise<void> {
    if (!claimId.trim()) {
      setError("Claim ID is required to run fraud detection.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fraudApi.runDetection(claimId.trim());
      const claimFlags = await fraudApi.getClaimFlags(response.claimId);
      setFlags((previous) => {
        const filtered = previous.filter((item) => item.claimId !== response.claimId);
        return [...claimFlags, ...filtered];
      });
      setSuccess(`Fraud detection completed. Generated/updated ${response.flags.length} flag(s).`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Fraud detection failed.");
    } finally {
      setSaving(false);
    }
  }

  async function updateFlagStatus(flag: FraudFlag, status: FraudFlagStatus): Promise<void> {
    const reviewNote = window.prompt("Optional review note", flag.reviewNote ?? "") ?? "";

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await fraudApi.updateFlagStatus(flag.fraudFlagId, {
        status,
        reviewNote: reviewNote.trim() ? reviewNote.trim() : undefined
      });

      await loadFlags();
      setSuccess(`Flag ${flag.fraudFlagId} moved to ${status}.`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to update fraud flag status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Fraud Review Dashboard</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/claims")}>Back to Claims</Button>
            <Button variant="contained" onClick={() => void loadFlags()} disabled={loading || saving}>Refresh</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Claim ID"
            value={claimId}
            onChange={(event) => setClaimId(event.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={() => void runDetectionForClaim()} disabled={saving}>
            Run Fraud Detection
          </Button>
          <TextField
            select
            label="Status Filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "All" | FraudFlagStatus)}
            sx={{ minWidth: 220 }}
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Claim Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Rule</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Workflow</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flags.map((flag) => (
              <TableRow key={flag.fraudFlagId}>
                <TableCell>{flag.claimNumber}</TableCell>
                <TableCell>{flag.flagType}</TableCell>
                <TableCell>{flag.ruleName ?? "-"}</TableCell>
                <TableCell>{flag.severityScore}</TableCell>
                <TableCell>{flag.status}</TableCell>
                <TableCell>{flag.reason}</TableCell>
                <TableCell>{new Date(flag.createdAtUtc).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={saving || flag.status === "UnderInvestigation"}
                      onClick={() => void updateFlagStatus(flag, "UnderInvestigation")}
                    >
                      Investigate
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      disabled={saving || flag.status === "ConfirmedFraud"}
                      onClick={() => void updateFlagStatus(flag, "ConfirmedFraud")}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      disabled={saving || flag.status === "Cleared"}
                      onClick={() => void updateFlagStatus(flag, "Cleared")}
                    >
                      Clear
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loading ? <Typography sx={{ mt: 2 }}>Loading fraud flags...</Typography> : null}
      </Paper>
    </Box>
  );
}
