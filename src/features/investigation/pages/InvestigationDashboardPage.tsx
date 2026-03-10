import {
  Alert,
  Box,
  Button,
  LinearProgress,
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
import { useNavigate } from "react-router-dom";
import { claimApi } from "../../claims/api/claimApi";
import { ClaimInvestigation, ClaimSummary } from "../../claims/types";

const INVESTIGATION_DOC_CATEGORIES = ["Evidence", "AccidentPhoto", "PoliceReport", "MedicalReport"] as const;

type InvestigationDocCategory = typeof INVESTIGATION_DOC_CATEGORIES[number];

export function InvestigationDashboardPage() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<ClaimInvestigation | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState<InvestigationDocCategory>("Evidence");

  const [noteText, setNoteText] = useState("");
  const [noteProgress, setNoteProgress] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.claimId === selectedClaimId) ?? null,
    [claims, selectedClaimId]
  );

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedClaimId) {
      setInvestigation(null);
      return;
    }

    void loadInvestigation(selectedClaimId);
  }, [selectedClaimId]);

  async function loadDashboard(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await claimApi.getInvestigationDashboard();
      setClaims(response);
      if (response.length > 0) {
        setSelectedClaimId((current) => current ?? response[0].claimId);
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load investigation dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function loadInvestigation(claimId: string): Promise<void> {
    setError(null);

    try {
      const response = await claimApi.getClaimInvestigation(claimId);
      setInvestigation(response);
      setProgressPercent(response.investigationProgress);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load investigation details.");
    }
  }

  async function runAction(action: () => Promise<unknown>, successMessage: string): Promise<void> {
    if (!selectedClaimId) {
      setError("Select a claim first.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await action();
      await Promise.all([loadDashboard(), loadInvestigation(selectedClaimId)]);
      setSuccess(successMessage);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to complete investigation action.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(): Promise<void> {
    if (!selectedClaimId || !selectedFile) {
      setError("Select a claim and a file to upload.");
      return;
    }

    await runAction(
      () => claimApi.uploadInvestigationDocument(selectedClaimId, selectedFile, documentCategory),
      `${documentCategory} uploaded successfully.`
    );

    setSelectedFile(null);
  }

  async function addNote(): Promise<void> {
    if (!selectedClaimId || noteText.trim().length === 0) {
      setError("Note text is required.");
      return;
    }

    const parsedProgress = noteProgress.trim().length > 0 ? Number(noteProgress) : undefined;
    if (parsedProgress !== undefined && (Number.isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100)) {
      setError("Note progress snapshot must be between 0 and 100.");
      return;
    }

    await runAction(
      () => claimApi.addInvestigatorNote(selectedClaimId, {
        noteText: noteText.trim(),
        progressPercentSnapshot: parsedProgress
      }),
      "Investigator note added successfully."
    );

    setNoteText("");
    setNoteProgress("");
  }

  async function updateProgress(): Promise<void> {
    if (!selectedClaimId) {
      setError("Select a claim first.");
      return;
    }

    if (progressPercent < 0 || progressPercent > 100) {
      setError("Progress must be between 0 and 100.");
      return;
    }

    await runAction(
      () => claimApi.updateInvestigationProgress(selectedClaimId, { progressPercent }),
      "Investigation progress updated successfully."
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Claim Investigation Dashboard</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/claims")}>Back to Claims</Button>
            <Button variant="contained" onClick={() => void loadDashboard()} disabled={loading || saving}>Refresh</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.8fr 1.2fr" }, gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Investigation Queue</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Investigator</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.claimId} selected={claim.claimId === selectedClaimId} hover>
                    <TableCell>{claim.claimNumber}</TableCell>
                    <TableCell>{claim.claimStatus}</TableCell>
                    <TableCell>{claim.investigatorUserId ?? "-"}</TableCell>
                    <TableCell>{claim.investigationProgress}%</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setSelectedClaimId(claim.claimId)}>Select</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading ? <Typography sx={{ mt: 1 }}>Loading dashboard...</Typography> : null}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Investigation Actions</Typography>
            {selectedClaim && investigation ? (
              <Stack spacing={2}>
                <Typography><b>Claim:</b> {selectedClaim.claimNumber}</Typography>
                <Typography><b>Status:</b> {investigation.claimStatus}</Typography>
                <Typography><b>Progress:</b> {investigation.investigationProgress}%</Typography>
                <LinearProgress variant="determinate" value={investigation.investigationProgress} />

                <TextField
                  label="Set Investigation Progress"
                  type="number"
                  value={progressPercent}
                  onChange={(event) => setProgressPercent(Number(event.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
                <Button variant="contained" onClick={() => void updateProgress()} disabled={saving}>Update Progress</Button>

                <TextField
                  label="Investigator Note"
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  minRows={3}
                  multiline
                />
                <TextField
                  label="Progress Snapshot (optional)"
                  type="number"
                  value={noteProgress}
                  onChange={(event) => setNoteProgress(event.target.value)}
                  inputProps={{ min: 0, max: 100 }}
                />
                <Button variant="contained" onClick={() => void addNote()} disabled={saving}>Add Investigator Note</Button>

                <TextField
                  select
                  label="Document Category"
                  value={documentCategory}
                  onChange={(event) => setDocumentCategory(event.target.value as InvestigationDocCategory)}
                >
                  {INVESTIGATION_DOC_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </TextField>
                <input
                  type="file"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <Button variant="contained" onClick={() => void uploadDocument()} disabled={saving || !selectedFile}>Upload Investigation Document</Button>

                <Button variant="outlined" onClick={() => navigate(`/claims/${selectedClaim.claimId}`)}>Open Claim Detail</Button>
              </Stack>
            ) : (
              <Typography>Select a claim to manage investigation.</Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Investigation Documents</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Uploaded</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(investigation?.documents ?? []).map((document) => (
                  <TableRow key={document.claimDocumentId}>
                    <TableCell>{document.originalFileName}</TableCell>
                    <TableCell>{document.documentCategory}</TableCell>
                    <TableCell>{document.contentType}</TableCell>
                    <TableCell>{new Date(document.uploadedAtUtc).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Investigator Notes</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Note</TableCell>
                  <TableCell>Progress Snapshot</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(investigation?.notes ?? []).map((note) => (
                  <TableRow key={note.claimInvestigationNoteId}>
                    <TableCell>{note.noteText}</TableCell>
                    <TableCell>{note.progressPercentSnapshot ?? "-"}</TableCell>
                    <TableCell>{note.createdByUserId ?? "System"}</TableCell>
                    <TableCell>{new Date(note.createdAtUtc).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
