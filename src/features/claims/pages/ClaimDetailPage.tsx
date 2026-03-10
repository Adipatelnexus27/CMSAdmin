import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { claimApi } from "../api/claimApi";
import { ClaimDetail } from "../types";

export function ClaimDetailPage() {
  const navigate = useNavigate();
  const { claimId } = useParams();

  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [relatedClaimId, setRelatedClaimId] = useState("");

  async function loadClaim(): Promise<void> {
    if (!claimId) {
      setError("Claim ID is missing.");
      return;
    }

    setError(null);
    try {
      setClaim(await claimApi.getClaimDetail(claimId));
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Unable to load claim detail.");
    }
  }

  useEffect(() => {
    void loadClaim();
  }, [claimId]);

  async function uploadDocument(): Promise<void> {
    if (!claimId || !selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setError(null);
    try {
      await claimApi.uploadClaimDocument(claimId, selectedFile);
      setSelectedFile(null);
      await loadClaim();
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
    try {
      await claimApi.linkRelatedClaim(claimId, relatedClaimId.trim());
      setRelatedClaimId("");
      await loadClaim();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Linking failed.");
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Claim Detail</Typography>
          <Button variant="outlined" onClick={() => navigate("/claims")}>Back to List</Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {claim ? (
          <Stack spacing={2}>
            <Typography><b>Claim Number:</b> {claim.claimNumber}</Typography>
            <Typography><b>Policy:</b> {claim.policyNumber}</Typography>
            <Typography><b>Status:</b> {claim.claimStatus}</Typography>
            <Typography><b>Type:</b> {claim.claimType}</Typography>
            <Typography><b>Reporter:</b> {claim.reporterName}</Typography>
            <Typography><b>Incident Date:</b> {new Date(claim.incidentDateUtc).toLocaleString()}</Typography>
            <Typography><b>Location:</b> {claim.incidentLocation}</Typography>
            <Typography><b>Description:</b> {claim.incidentDescription}</Typography>

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
