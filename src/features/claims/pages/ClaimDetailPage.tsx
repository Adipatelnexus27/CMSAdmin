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
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { configurationApi } from "../../configuration/api/configurationApi";
import { claimApi } from "../api/claimApi";
import { ClaimDetail } from "../types";

const PRIORITY_OPTIONS = [1, 2, 3, 4, 5];
const DEFAULT_WORKFLOW_STEP = "Registration";

export function ClaimDetailPage() {
  const navigate = useNavigate();
  const { claimId } = useParams();

  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [relatedClaimId, setRelatedClaimId] = useState("");

  const [investigatorUserId, setInvestigatorUserId] = useState("");
  const [adjusterUserId, setAdjusterUserId] = useState("");
  const [priority, setPriority] = useState(2);
  const [claimStatus, setClaimStatus] = useState("New");
  const [workflowStep, setWorkflowStep] = useState(DEFAULT_WORKFLOW_STEP);

  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [workflowOptions, setWorkflowOptions] = useState<string[]>([]);

  const workflowStepChoices = useMemo(
    () => (workflowOptions.length > 0 ? workflowOptions : [DEFAULT_WORKFLOW_STEP]),
    [workflowOptions]
  );

  async function loadClaim(): Promise<void> {
    if (!claimId) {
      setError("Claim ID is missing.");
      return;
    }

    setError(null);
    try {
      const detail = await claimApi.getClaimDetail(claimId);
      setClaim(detail);
      setInvestigatorUserId(detail.investigatorUserId ?? "");
      setAdjusterUserId(detail.adjusterUserId ?? "");
      setPriority(detail.priority);
      setClaimStatus(detail.claimStatus);
      setWorkflowStep(detail.workflowStep);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load claim detail.");
    }
  }

  async function loadLookupData(): Promise<void> {
    try {
      const [statuses, workflows] = await Promise.all([
        configurationApi.getLookupItems("ClaimStatus"),
        configurationApi.getWorkflowSettings()
      ]);

      setStatusOptions(statuses.filter((item) => item.isActive).map((item) => item.name));
      setWorkflowOptions(
        workflows
          .filter((item) => item.isActive && item.workflowKey.toLowerCase() === "claim")
          .sort((a, b) => a.stepSequence - b.stepSequence)
          .map((item) => item.stepName)
      );
    } catch {
      setStatusOptions([]);
      setWorkflowOptions([]);
    }
  }

  useEffect(() => {
    void loadClaim();
    void loadLookupData();
  }, [claimId]);

  async function uploadDocument(): Promise<void> {
    if (!claimId || !selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await claimApi.uploadClaimDocument(claimId, selectedFile);
      setSelectedFile(null);
      await loadClaim();
      setSuccess("Document uploaded successfully.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Upload failed.");
    }
  }

  async function linkRelatedClaim(): Promise<void> {
    if (!claimId || !relatedClaimId) {
      setError("Provide a related claim ID.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await claimApi.linkRelatedClaim(claimId, relatedClaimId.trim());
      setRelatedClaimId("");
      await loadClaim();
      setSuccess("Related claim linked successfully.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Linking failed.");
    }
  }

  async function runClaimUpdate(action: () => Promise<void>, successMessage: string): Promise<void> {
    if (!claimId) {
      setError("Claim ID is missing.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await action();
      await loadClaim();
      setSuccess(successMessage);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Action failed.");
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Claim Detail</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/claims/triage")}>Triage Queue</Button>
            <Button variant="outlined" onClick={() => navigate("/claims")}>Back to List</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        {claim ? (
          <Stack spacing={2}>
            <Typography><b>Claim Number:</b> {claim.claimNumber}</Typography>
            <Typography><b>Policy:</b> {claim.policyNumber}</Typography>
            <Typography><b>Status:</b> {claim.claimStatus}</Typography>
            <Typography><b>Priority:</b> {claim.priority}</Typography>
            <Typography><b>Workflow Step:</b> {claim.workflowStep}</Typography>
            <Typography><b>Investigator:</b> {claim.investigatorUserId ?? "-"}</Typography>
            <Typography><b>Adjuster:</b> {claim.adjusterUserId ?? "-"}</Typography>
            <Typography><b>Type:</b> {claim.claimType}</Typography>
            <Typography><b>Reporter:</b> {claim.reporterName}</Typography>
            <Typography><b>Incident Date:</b> {new Date(claim.incidentDateUtc).toLocaleString()}</Typography>
            <Typography><b>Location:</b> {claim.incidentLocation}</Typography>
            <Typography><b>Description:</b> {claim.incidentDescription}</Typography>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Triage & Workflow Management</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Investigator User ID"
                  value={investigatorUserId}
                  onChange={(event) => setInvestigatorUserId(event.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={() => void runClaimUpdate(
                    () => claimApi.assignInvestigator(claim.claimId, { investigatorUserId: investigatorUserId.trim() }),
                    "Investigator assigned successfully."
                  )}
                  disabled={investigatorUserId.trim().length === 0}
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
                  onClick={() => void runClaimUpdate(
                    () => claimApi.assignAdjuster(claim.claimId, { adjusterUserId: adjusterUserId.trim() }),
                    "Adjuster assigned successfully."
                  )}
                  disabled={adjusterUserId.trim().length === 0}
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
                  onClick={() => void runClaimUpdate(
                    () => claimApi.setPriority(claim.claimId, { priority }),
                    "Claim priority updated successfully."
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
                  {(statusOptions.length > 0 ? statusOptions : [claim.claimStatus]).map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  onClick={() => void runClaimUpdate(
                    () => claimApi.updateStatus(claim.claimId, { claimStatus: claimStatus.trim() }),
                    "Claim status updated successfully."
                  )}
                  disabled={claimStatus.trim().length === 0}
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
                  {workflowStepChoices.map((step) => (
                    <MenuItem key={step} value={step}>{step}</MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  onClick={() => void runClaimUpdate(
                    () => claimApi.updateWorkflowStep(claim.claimId, { workflowStep: workflowStep.trim() }),
                    "Workflow step updated successfully."
                  )}
                  disabled={workflowStep.trim().length === 0}
                >
                  Update Workflow Step
                </Button>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Upload Document</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                <input
                  type="file"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <Button variant="contained" onClick={uploadDocument}>Upload</Button>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Link Related Claim</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Related Claim ID"
                  value={relatedClaimId}
                  onChange={(event) => setRelatedClaimId(event.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={linkRelatedClaim}>Link</Button>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Workflow History</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Previous</TableCell>
                    <TableCell>New</TableCell>
                    <TableCell>Changed By</TableCell>
                    <TableCell>Changed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claim.workflowHistory.map((history) => (
                    <TableRow key={history.claimWorkflowHistoryId}>
                      <TableCell>{history.actionType}</TableCell>
                      <TableCell>{history.previousValue ?? "-"}</TableCell>
                      <TableCell>{history.newValue}</TableCell>
                      <TableCell>{history.changedByUserId ?? "System"}</TableCell>
                      <TableCell>{new Date(history.changedAtUtc).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Documents</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Size (bytes)</TableCell>
                    <TableCell>Uploaded</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claim.documents.map((doc) => (
                    <TableRow key={doc.claimDocumentId}>
                      <TableCell>{doc.originalFileName}</TableCell>
                      <TableCell>{doc.contentType}</TableCell>
                      <TableCell>{doc.fileSizeBytes}</TableCell>
                      <TableCell>{new Date(doc.uploadedAtUtc).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Related Claims</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Claim Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Claim ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claim.relatedClaims.map((related) => (
                    <TableRow key={related.claimId}>
                      <TableCell>{related.claimNumber}</TableCell>
                      <TableCell>{related.claimStatus}</TableCell>
                      <TableCell>{related.claimId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Paper>
    </Box>
  );
}
