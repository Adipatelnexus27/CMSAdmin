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
import { reserveApi } from "../api/reserveApi";
import { ClaimReserveHistory, ReserveHistoryStatus } from "../types";

const STATUS_OPTIONS: ReserveHistoryStatus[] = ["PendingApproval", "Approved", "Rejected"];

export function ReserveApprovalPage() {
  const [status, setStatus] = useState<ReserveHistoryStatus>("PendingApproval");
  const [items, setItems] = useState<ClaimReserveHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadQueue();
  }, [status]);

  async function loadQueue(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      setItems(await reserveApi.getApprovalQueue(status));
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load reserve approval queue.");
    } finally {
      setLoading(false);
    }
  }

  async function approve(item: ClaimReserveHistory): Promise<void> {
    const approvalNote = window.prompt("Approval note (optional)", item.approvalNote ?? "") ?? "";

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await reserveApi.approveAdjustment(item.claimReserveHistoryId, { approvalNote: approvalNote.trim() || undefined });
      await loadQueue();
      setSuccess("Reserve adjustment approved.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to approve reserve adjustment.");
    } finally {
      setSaving(false);
    }
  }

  async function reject(item: ClaimReserveHistory): Promise<void> {
    const approvalNote = window.prompt("Rejection note (optional)", item.approvalNote ?? "") ?? "";

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await reserveApi.rejectAdjustment(item.claimReserveHistoryId, { approvalNote: approvalNote.trim() || undefined });
      await loadQueue();
      setSuccess("Reserve adjustment rejected.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to reject reserve adjustment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Reserve Approval Workflow</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ReserveHistoryStatus)}
              sx={{ minWidth: 200 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={() => void loadQueue()} disabled={loading || saving}>Refresh</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Claim Number</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Previous</TableCell>
              <TableCell>Requested</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.claimReserveHistoryId}>
                <TableCell>{item.claimNumber}</TableCell>
                <TableCell>{new Date(item.requestedAtUtc).toLocaleString()}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.previousReserveAmount ?? "-"}</TableCell>
                <TableCell>{item.requestedReserveAmount}</TableCell>
                <TableCell>{item.reason ?? "-"}</TableCell>
                <TableCell align="right">
                  {item.status === "PendingApproval" ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="contained" color="success" disabled={saving} onClick={() => void approve(item)}>Approve</Button>
                      <Button size="small" variant="contained" color="error" disabled={saving} onClick={() => void reject(item)}>Reject</Button>
                    </Stack>
                  ) : (
                    <Typography variant="body2">No actions</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loading ? <Typography sx={{ mt: 2 }}>Loading reserve approvals...</Typography> : null}
      </Paper>
    </Box>
  );
}
