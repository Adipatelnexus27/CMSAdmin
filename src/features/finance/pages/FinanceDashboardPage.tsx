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
import { financeApi } from "../api/financeApi";
import { ClaimPayment, ClaimPaymentStatusHistory, ClaimSettlement, PaymentStatus } from "../types";

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PendingApproval", "Approved", "Rejected", "Processing", "Paid", "Failed"];

export function FinanceDashboardPage() {
  const [claimId, setClaimId] = useState("");
  const [grossLossAmount, setGrossLossAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRequestNote, setPaymentRequestNote] = useState("");

  const [queueFilter, setQueueFilter] = useState<"All" | PaymentStatus>("All");

  const [settlement, setSettlement] = useState<ClaimSettlement | null>(null);
  const [claimPayments, setClaimPayments] = useState<ClaimPayment[]>([]);
  const [queuePayments, setQueuePayments] = useState<ClaimPayment[]>([]);
  const [statusHistory, setStatusHistory] = useState<ClaimPaymentStatusHistory[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadPaymentQueue();
  }, [queueFilter]);

  async function loadPaymentQueue(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const rows = await financeApi.getPayments(queueFilter === "All" ? undefined : queueFilter);
      setQueuePayments(rows);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load payment queue.");
    } finally {
      setLoading(false);
    }
  }

  async function loadClaimFinancials(): Promise<void> {
    const normalizedClaimId = claimId.trim();
    if (!normalizedClaimId) {
      setError("Claim ID is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      try {
        const settlementResponse = await financeApi.getSettlementByClaimId(normalizedClaimId);
        setSettlement(settlementResponse);
      } catch {
        setSettlement(null);
      }

      const paymentsResponse = await financeApi.getClaimPayments(normalizedClaimId);
      setClaimPayments(paymentsResponse);
      setStatusHistory([]);
      setSelectedPaymentId(null);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load claim financial details.");
      setClaimPayments([]);
      setSettlement(null);
    } finally {
      setLoading(false);
    }
  }

  async function calculateSettlement(): Promise<void> {
    const normalizedClaimId = claimId.trim();
    const grossLoss = Number(grossLossAmount);

    if (!normalizedClaimId || Number.isNaN(grossLoss) || grossLoss <= 0) {
      setError("Valid claim ID and gross loss amount are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const settlementResponse = await financeApi.calculateSettlement(normalizedClaimId, {
        grossLossAmount: grossLoss,
        currencyCode: currencyCode.trim().toUpperCase() || "USD"
      });

      setSettlement(settlementResponse);
      await Promise.all([loadClaimFinancials(), loadPaymentQueue()]);
      setSuccess("Settlement calculated successfully.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to calculate settlement.");
    } finally {
      setSaving(false);
    }
  }

  async function requestPaymentApproval(): Promise<void> {
    if (!settlement) {
      setError("Calculate or load settlement before requesting payment approval.");
      return;
    }

    const amount = Number(paymentAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Valid payment amount is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await financeApi.requestPaymentApproval(settlement.claimSettlementId, {
        paymentAmount: amount,
        requestNote: paymentRequestNote.trim() || undefined
      });

      await Promise.all([loadClaimFinancials(), loadPaymentQueue()]);
      setSuccess("Payment request submitted for approval.");
      setPaymentAmount("");
      setPaymentRequestNote("");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to request payment approval.");
    } finally {
      setSaving(false);
    }
  }

  async function approvePayment(payment: ClaimPayment): Promise<void> {
    const note = window.prompt("Approval note (optional)", payment.approvalNote ?? "") ?? "";
    await runPaymentAction(
      () => financeApi.approvePayment(payment.claimPaymentId, { approvalNote: note.trim() || undefined }),
      "Payment approved."
    );
  }

  async function rejectPayment(payment: ClaimPayment): Promise<void> {
    const note = window.prompt("Rejection note (optional)", payment.approvalNote ?? "") ?? "";
    await runPaymentAction(
      () => financeApi.rejectPayment(payment.claimPaymentId, { approvalNote: note.trim() || undefined }),
      "Payment rejected."
    );
  }

  async function updatePaymentStatus(payment: ClaimPayment, nextStatus: PaymentStatus): Promise<void> {
    const note = window.prompt(`Status note for ${nextStatus} (optional)`, payment.statusNote ?? "") ?? "";
    await runPaymentAction(
      () => financeApi.updatePaymentStatus(payment.claimPaymentId, { paymentStatus: nextStatus, statusNote: note.trim() || undefined }),
      `Payment moved to ${nextStatus}.`
    );
  }

  async function runPaymentAction(action: () => Promise<void>, successMessage: string): Promise<void> {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await action();
      await Promise.all([loadPaymentQueue(), claimId.trim() ? loadClaimFinancials() : Promise.resolve()]);
      if (selectedPaymentId) {
        await loadPaymentStatusHistory(selectedPaymentId);
      }
      setSuccess(successMessage);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to complete payment operation.");
    } finally {
      setSaving(false);
    }
  }

  async function loadPaymentStatusHistory(claimPaymentId: string): Promise<void> {
    setSelectedPaymentId(claimPaymentId);
    setError(null);

    try {
      const rows = await financeApi.getPaymentStatusHistory(claimPaymentId);
      setStatusHistory(rows);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load payment status history.");
      setStatusHistory([]);
    }
  }

  function renderPaymentActions(payment: ClaimPayment) {
    if (payment.paymentStatus === "PendingApproval") {
      return (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" variant="contained" color="success" disabled={saving} onClick={() => void approvePayment(payment)}>Approve</Button>
          <Button size="small" variant="contained" color="error" disabled={saving} onClick={() => void rejectPayment(payment)}>Reject</Button>
        </Stack>
      );
    }

    if (payment.paymentStatus === "Approved") {
      return (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" variant="outlined" disabled={saving} onClick={() => void updatePaymentStatus(payment, "Processing")}>Processing</Button>
          <Button size="small" variant="outlined" disabled={saving} onClick={() => void updatePaymentStatus(payment, "Paid")}>Paid</Button>
          <Button size="small" variant="outlined" disabled={saving} onClick={() => void updatePaymentStatus(payment, "Failed")}>Failed</Button>
        </Stack>
      );
    }

    if (payment.paymentStatus === "Processing") {
      return (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" variant="outlined" disabled={saving} onClick={() => void updatePaymentStatus(payment, "Paid")}>Paid</Button>
          <Button size="small" variant="outlined" disabled={saving} onClick={() => void updatePaymentStatus(payment, "Failed")}>Failed</Button>
        </Stack>
      );
    }

    return <Typography variant="body2">No actions</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Settlement Processing & Payments</Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Settlement Calculation</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Claim ID" value={claimId} onChange={(event) => setClaimId(event.target.value)} fullWidth />
            <TextField label="Gross Loss Amount" type="number" value={grossLossAmount} onChange={(event) => setGrossLossAmount(event.target.value)} inputProps={{ min: 0, step: "0.01" }} />
            <TextField label="Currency" value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())} inputProps={{ maxLength: 3 }} />
            <Button variant="outlined" onClick={() => void loadClaimFinancials()} disabled={loading || saving}>Load</Button>
            <Button variant="contained" onClick={() => void calculateSettlement()} disabled={saving}>Calculate</Button>
          </Stack>

          {settlement ? (
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Typography><b>Claim Number:</b> {settlement.claimNumber}</Typography>
              <Typography><b>Gross Loss:</b> {settlement.grossLossAmount.toFixed(2)} {settlement.currencyCode}</Typography>
              <Typography><b>Policy Limit:</b> {settlement.policyLimitAmount.toFixed(2)} {settlement.currencyCode}</Typography>
              <Typography><b>Deductible:</b> {settlement.deductibleAmount.toFixed(2)} {settlement.currencyCode}</Typography>
              <Typography><b>Eligible Amount:</b> {settlement.eligibleAmount.toFixed(2)} {settlement.currencyCode}</Typography>
              <Typography><b>Approved Settlement:</b> {settlement.approvedSettlementAmount.toFixed(2)} {settlement.currencyCode}</Typography>
            </Stack>
          ) : null}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Request Payment Approval</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Payment Amount" type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} inputProps={{ min: 0, step: "0.01" }} />
            <TextField label="Request Note" value={paymentRequestNote} onChange={(event) => setPaymentRequestNote(event.target.value)} fullWidth />
            <Button variant="contained" onClick={() => void requestPaymentApproval()} disabled={saving || !settlement}>Submit</Button>
          </Stack>
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Claim Payments</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimPayments.map((payment) => (
                  <TableRow key={payment.claimPaymentId}>
                    <TableCell>{payment.paymentStatus}</TableCell>
                    <TableCell>{payment.paymentAmount.toFixed(2)} {payment.currencyCode}</TableCell>
                    <TableCell>{new Date(payment.requestedAtUtc).toLocaleString()}</TableCell>
                    <TableCell>{payment.requestNote ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Payment Approval & Tracking</Typography>
              <TextField
                select
                size="small"
                label="Filter"
                value={queueFilter}
                onChange={(event) => setQueueFilter(event.target.value as "All" | PaymentStatus)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="All">All</MenuItem>
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell align="right">Workflow</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queuePayments.map((payment) => (
                  <TableRow key={payment.claimPaymentId} selected={selectedPaymentId === payment.claimPaymentId}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{payment.claimNumber}</Typography>
                        <Button size="small" onClick={() => void loadPaymentStatusHistory(payment.claimPaymentId)}>History</Button>
                      </Stack>
                    </TableCell>
                    <TableCell>{payment.paymentStatus}</TableCell>
                    <TableCell>{payment.paymentAmount.toFixed(2)} {payment.currencyCode}</TableCell>
                    <TableCell align="right">{renderPaymentActions(payment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Payment Status History</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Changed At</TableCell>
                <TableCell>Previous</TableCell>
                <TableCell>New</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Changed By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusHistory.map((history) => (
                <TableRow key={history.claimPaymentStatusHistoryId}>
                  <TableCell>{new Date(history.changedAtUtc).toLocaleString()}</TableCell>
                  <TableCell>{history.previousStatus || "-"}</TableCell>
                  <TableCell>{history.newStatus}</TableCell>
                  <TableCell>{history.note ?? "-"}</TableCell>
                  <TableCell>{history.changedByUserId ?? "System"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {loading ? <Typography sx={{ mt: 1 }}>Loading finance data...</Typography> : null}
        </Paper>
      </Paper>
    </Box>
  );
}
