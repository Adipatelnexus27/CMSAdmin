import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { documentApi } from "../api/documentApi";
import { ClaimDocumentRecord, DocumentCategory } from "../types";

const CATEGORY_OPTIONS: DocumentCategory[] = [
  "General",
  "Evidence",
  "AccidentPhoto",
  "PoliceReport",
  "MedicalReport",
  "Invoice",
  "Settlement"
];

export function DocumentManagementPage() {
  const navigate = useNavigate();

  const [claimId, setClaimId] = useState("");
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>("General");
  const [documentGroupId, setDocumentGroupId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [latestOnly, setLatestOnly] = useState(true);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [documents, setDocuments] = useState<ClaimDocumentRecord[]>([]);
  const [versions, setVersions] = useState<ClaimDocumentRecord[]>([]);
  const [versionsTitle, setVersionsTitle] = useState("");
  const [versionsOpen, setVersionsOpen] = useState(false);

  async function loadDocuments(): Promise<void> {
    if (claimId.trim().length === 0) {
      setError("Claim ID is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const list = await documentApi.getClaimDocuments(claimId.trim(), latestOnly);
      setDocuments(list);
      setSuccess(`Loaded ${list.length} document(s).`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocument(): Promise<void> {
    if (claimId.trim().length === 0) {
      setError("Claim ID is required.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await documentApi.uploadDocument(
        claimId.trim(),
        selectedFile,
        documentCategory,
        documentGroupId.trim().length > 0 ? documentGroupId.trim() : undefined
      );

      setSelectedFile(null);
      setDocumentGroupId("");
      await loadDocuments();
      setSuccess("Document uploaded successfully.");
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Document upload failed.");
    } finally {
      setSaving(false);
    }
  }

  async function openVersions(documentId: string, title: string): Promise<void> {
    setError(null);
    setSuccess(null);

    try {
      const list = await documentApi.getDocumentVersions(documentId);
      setVersions(list);
      setVersionsTitle(title);
      setVersionsOpen(true);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load versions.");
    }
  }

  async function previewDocument(documentId: string): Promise<void> {
    setError(null);

    try {
      const blob = await documentApi.previewDocument(documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to preview document.");
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>): void {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Document Management</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/")}>Dashboard</Button>
            <Button variant="outlined" onClick={() => navigate("/claims")}>Claims</Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Stack spacing={2}>
          <TextField
            label="Claim ID"
            value={claimId}
            onChange={(event) => setClaimId(event.target.value)}
            fullWidth
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              label="Document Category"
              value={documentCategory}
              onChange={(event) => setDocumentCategory(event.target.value as DocumentCategory)}
              sx={{ minWidth: 240 }}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Document Group ID (optional for new version)"
              value={documentGroupId}
              onChange={(event) => setDocumentGroupId(event.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <input type="file" onChange={onFileChange} />
            <Button variant="contained" onClick={() => void uploadDocument()} disabled={saving || !selectedFile}>
              {saving ? "Uploading..." : "Upload Document"}
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <FormControlLabel
              control={<Checkbox checked={latestOnly} onChange={(_, checked) => setLatestOnly(checked)} />}
              label="Latest versions only"
            />
            <Button variant="outlined" onClick={() => void loadDocuments()} disabled={loading}>
              {loading ? "Loading..." : "Load Documents"}
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Claim Documents</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Latest</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Uploaded At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.claimDocumentId}>
                  <TableCell>{document.originalFileName}</TableCell>
                  <TableCell>{document.documentCategory}</TableCell>
                  <TableCell>{document.versionNumber}</TableCell>
                  <TableCell>{document.isLatest ? "Yes" : "No"}</TableCell>
                  <TableCell>{document.documentGroupId}</TableCell>
                  <TableCell>{new Date(document.uploadedAtUtc).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => void previewDocument(document.claimDocumentId)}>Preview</Button>
                      <Button size="small" onClick={() => void openVersions(document.claimDocumentId, document.originalFileName)}>Versions</Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setDocumentGroupId(document.documentGroupId);
                          setDocumentCategory(document.documentCategory as DocumentCategory);
                        }}
                      >
                        New Version
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No documents found.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={versionsOpen} onClose={() => setVersionsOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Document Versions: {versionsTitle}</DialogTitle>
          <DialogContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((document) => (
                  <TableRow key={document.claimDocumentId}>
                    <TableCell>{document.versionNumber}</TableCell>
                    <TableCell>{document.documentCategory}</TableCell>
                    <TableCell>{document.uploadedByUserId ?? "System"}</TableCell>
                    <TableCell>{new Date(document.uploadedAtUtc).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => void previewDocument(document.claimDocumentId)}>Preview</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {versions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No versions found.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
}
