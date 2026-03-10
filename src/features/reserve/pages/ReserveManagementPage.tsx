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
import { useState } from "react";
import { reserveApi } from "../api/reserveApi";
import { ClaimReserve, ClaimReserveHistory } from "../types";

export function ReserveManagementPage() {
  const [claimId, setClaimId] = useState("");
  const [reserve, setReserve] = useState<ClaimReserve | null>(null);
  const [history, setHistory] = useState<ClaimReserveHistory[]>([]);

  const [initialAmount, setInitialAmount] = useState<string>("");
  const [initialCurrency, setInitialCurrency] = useState("USD");
  const [initialReason, setInitialReason] = useState("");

  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadReserveData(targetClaimId: string): Promise<void> {
    const normalizedClaimId = targetClaimId.trim();
    if (!normalizedClaimId) {
      setError("Claim ID is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const historyResponse = await reserveApi.getReserveHistory(normalizedClaimId);
      setHistory(historyResponse);

      try {
        const reserveResponse = await reserveApi.getClaimReserve(normalizedClaimId);
        setReserve(reserveResponse);
      } catch {
        setReserve(null);
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load reserve information.");
      setReserve(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  async function createInitialReserve(): Promise<void> {
    const normalizedClaimId = claimId.trim();
    const amount = Number(initialAmount);

    if (!normalizedClaimId || Number.isNaN(amount) || amount <= 0) {
      setError("Valid claim ID and initial reserve amount are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await reserveApi.createInitialReserve(normalizedClaimId, {
        reserveAmount: amount,
        currencyCode: initialCurrency.trim() || "USD",
        reason: initialReason.trim() || undefined
      });

      setReserve(response);
      await loadReserveData(normalizedClaimId);
      setSuccess("Initial reserve created successfully.");
      setInitialAmount("");
      setInitialReason("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to create initial reserve.");
    } finally {
      setSaving(false);
    }
  }

  async function adjustReserve(): Promise<void> {
    const normalizedClaimId = claimId.trim();
    const amount = Number(adjustAmount);

    if (!normalizedClaimId || Number.isNaN(amount) || amount <= 0) {
      setError("Valid claim ID and adjusted reserve amount are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await reserveApi.adjustReserve(normalizedClaimId, {
        reserveAmount: amount,
        reason: adjustReason.trim() || undefined
      });

      await loadReserveData(normalizedClaimId);
      setSuccess("Reserve adjustment submitted for approval.");
      setAdjustAmount("");
      setAdjustReason("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to request reserve adjustment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Claim Reserve Management</Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Claim ID"
            value={claimId}
            onChange={(event) => setClaimId(event.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => void loadReserveData(claimId)}
            disabled={loading || saving}
          >
            Load Reserve
          </Button>
        </Stack>

        {reserve ? (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography><b>Claim Number:</b> {reserve.claimNumber}</Typography>
            <Typography><b>Current Reserve:</b> {reserve.currentReserveAmount.toFixed(2)} {reserve.currencyCode}</Typography>
            <Typography><b>Last Approved:</b> {reserve.lastApprovedAtUtc ? new Date(reserve.lastApprovedAtUtc).toLocaleString() : "-"}</Typography>
          </Paper>
        ) : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Initial Reserve</Typography>
            <Stack spacing={2}>
              <TextField
                type="number"
                label="Amount"
                value={initialAmount}
                onChange={(event) => setInitialAmount(event.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
              />
              <TextField
                label="Currency Code"
                value={initialCurrency}
                onChange={(event) => setInitialCurrency(event.target.value.toUpperCase())}
                inputProps={{ maxLength: 3 }}
              />
              <TextField
                label="Reason"
                value={initialReason}
                onChange={(event) => setInitialReason(event.target.value)}
                multiline
                minRows={2}
              />
              <Button variant="contained" onClick={() => void createInitialReserve()} disabled={saving}>Create Initial Reserve</Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Adjust Reserve</Typography>
            <Stack spacing={2}>
              <TextField
                type="number"
                label="New Reserve Amount"
                value={adjustAmount}
                onChange={(event) => setAdjustAmount(event.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
              />
              <TextField
                label="Reason"
                value={adjustReason}
                onChange={(event) => setAdjustReason(event.target.value)}
                multiline
                minRows={2}
              />
              <Button variant="contained" onClick={() => void adjustReserve()} disabled={saving}>Submit Adjustment</Button>
            </Stack>
          </Paper>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Reserve History</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Requested</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Previous</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Approval Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.claimReserveHistoryId}>
                  <TableCell>{new Date(item.requestedAtUtc).toLocaleString()}</TableCell>
                  <TableCell>{item.actionType}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.previousReserveAmount ?? "-"}</TableCell>
                  <TableCell>{item.requestedReserveAmount}</TableCell>
                  <TableCell>{item.approvedReserveAmount ?? "-"}</TableCell>
                  <TableCell>{item.reason ?? "-"}</TableCell>
                  <TableCell>{item.approvalNote ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Paper>
    </Box>
  );
}
