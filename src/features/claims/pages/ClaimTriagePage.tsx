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
import { useNavigate, useSearchParams } from "react-router-dom";
import { claimApi } from "../api/claimApi";
import { ClaimSummary } from "../types";
import { configurationApi } from "../../configuration/api/configurationApi";
import { WorkflowSetting } from "../../configuration/types";

const DEFAULT_WORKFLOW_STEP = "Registration";
const PRIORITY_OPTIONS = [1, 2, 3, 4, 5];

export function ClaimTriagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [workflowOptions, setWorkflowOptions] = useState<string[]>([]);

  const [investigatorUserId, setInvestigatorUserId] = useState("");
  const [adjusterUserId, setAdjusterUserId] = useState("");
  const [priority, setPriority] = useState<number>(2);
  const [claimStatus, setClaimStatus] = useState("New");
  const [workflowStep, setWorkflowStep] = useState(DEFAULT_WORKFLOW_STEP);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedClaim = useMemo(
    () => claims.find((item) => item.claimId === selectedClaimId) ?? null,
    [claims, selectedClaimId]
  );

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedClaim) {
      setInvestigatorUserId("");
      setAdjusterUserId("");
      setPriority(2);
      setClaimStatus("New");
      setWorkflowStep(DEFAULT_WORKFLOW_STEP);
      return;
    }

    setInvestigatorUserId(selectedClaim.investigatorUserId ?? "");
    setAdjusterUserId(selectedClaim.adjusterUserId ?? "");
    setPriority(selectedClaim.priority);
    setClaimStatus(selectedClaim.claimStatus);
    setWorkflowStep(selectedClaim.workflowStep);
  }, [selectedClaim]);

  async function loadData(): Promise<void> {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const [claimList, statuses, workflows] = await Promise.all([
        claimApi.getClaims(),
        configurationApi.getLookupItems("ClaimStatus"),
        configurationApi.getWorkflowSettings()
      ]);

      setClaims(claimList);
      setStatusOptions(statuses.filter((item) => item.isActive).map((item) => item.name));
      setWorkflowOptions(
        workflows
          .filter((item: WorkflowSetting) => item.isActive && item.workflowKey.toLowerCase() === "claim")
          .sort((a, b) => a.stepSequence - b.stepSequence)
          .map((item) => item.stepName)
      );

      if (claimList.length > 0) {
        const claimIdFromUrl = searchParams.get("claimId");
        const hasRequestedClaim = claimIdFromUrl !== null && claimList.some((claim) => claim.claimId === claimIdFromUrl);
        setSelectedClaimId((current) => current ?? (hasRequestedClaim ? claimIdFromUrl : claimList[0].claimId));
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load triage data.");
    } finally {
      setLoading(false);
    }
  }

  async function executeAction(action: () => Promise<void>, successMessage: string): Promise<void> {
    if (!selectedClaim) {
      setError("Select a claim first.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await action();
      await loadData();
      setSelectedClaimId(selectedClaim.claimId);
      setSuccess(successMessage);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to complete action.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Claim Triage & Assignment</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/claims")}>Back to Claims</Button>
            <Button variant="contained" onClick={() => void loadData()} disabled={loading || saving}>Refresh</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1.4fr" }, gap: 2 }}>
          <Box>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Claims Queue</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Claim Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Workflow</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow
                      key={claim.claimId}
                      selected={claim.claimId === selectedClaimId}
                      hover
                    >
                      <TableCell>{claim.claimNumber}</TableCell>
                      <TableCell>{claim.claimStatus}</TableCell>
                      <TableCell>{claim.priority}</TableCell>
                      <TableCell>{claim.workflowStep}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setSelectedClaimId(claim.claimId)}>
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loading ? <Typography sx={{ mt: 1 }}>Loading triage queue...</Typography> : null}
            </Paper>
          </Box>

          <Box>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Assignment & Workflow</Typography>
              {selectedClaim ? (
                <Stack spacing={2}>
                  <Typography><b>Claim:</b> {selectedClaim.claimNumber}</Typography>

                  <TextField
                    label="Investigator User ID"
                    value={investigatorUserId}
                    onChange={(event) => setInvestigatorUserId(event.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    disabled={saving || investigatorUserId.trim().length === 0}
                    onClick={() => void executeAction(
                      () => claimApi.assignInvestigator(selectedClaim.claimId, { investigatorUserId: investigatorUserId.trim() }),
                      "Investigator assigned successfully."
                    )}
                  >
                    Assign Investigator
                  </Button>

                  <TextField
                    label="Adjuster User ID"
                    value={adjusterUserId}
                    onChange={(event) => setAdjusterUserId(event.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    disabled={saving || adjusterUserId.trim().length === 0}
                    onClick={() => void executeAction(
                      () => claimApi.assignAdjuster(selectedClaim.claimId, { adjusterUserId: adjusterUserId.trim() }),
                      "Adjuster assigned successfully."
                    )}
                  >
                    Assign Adjuster
                  </Button>

                  <TextField
                    select
                    label="Priority"
                    value={priority}
                    onChange={(event) => setPriority(Number(event.target.value))}
                    fullWidth
                  >
                    {PRIORITY_OPTIONS.map((value) => (
                      <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    disabled={saving}
                    onClick={() => void executeAction(
                      () => claimApi.setPriority(selectedClaim.claimId, { priority }),
                      "Priority updated successfully."
                    )}
                  >
                    Update Priority
                  </Button>

                  <TextField
                    select
                    label="Claim Status"
                    value={claimStatus}
                    onChange={(event) => setClaimStatus(event.target.value)}
                    fullWidth
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    disabled={saving || claimStatus.trim().length === 0}
                    onClick={() => void executeAction(
                      () => claimApi.updateStatus(selectedClaim.claimId, { claimStatus: claimStatus.trim() }),
                      "Claim status updated successfully."
                    )}
                  >
                    Update Status
                  </Button>

                  <TextField
                    select
                    label="Workflow Step"
                    value={workflowStep}
                    onChange={(event) => setWorkflowStep(event.target.value)}
                    fullWidth
                  >
                    {(workflowOptions.length > 0 ? workflowOptions : [DEFAULT_WORKFLOW_STEP]).map((step) => (
                      <MenuItem key={step} value={step}>{step}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    disabled={saving || workflowStep.trim().length === 0}
                    onClick={() => void executeAction(
                      () => claimApi.updateWorkflowStep(selectedClaim.claimId, { workflowStep: workflowStep.trim() }),
                      "Workflow step updated successfully."
                    )}
                  >
                    Update Workflow Step
                  </Button>

                  <Button variant="outlined" onClick={() => navigate(`/claims/${selectedClaim.claimId}`)}>
                    Open Claim Detail
                  </Button>
                </Stack>
              ) : (
                <Typography>Select a claim to manage triage and assignment.</Typography>
              )}
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
