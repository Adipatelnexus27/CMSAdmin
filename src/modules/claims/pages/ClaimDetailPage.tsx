import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ClaimDetails, claimsApi } from "@/modules/claims/api/claimsApi";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";
import { StatusChip } from "@/core/components/StatusChip";
import { EntityTable, TableColumn } from "@/core/components/EntityTable";

const documentColumns: TableColumn<ClaimDetails["documents"][number]>[] = [
  { key: "claimDocumentId", header: "Doc ID" },
  { key: "documentTypeId", header: "Doc Type" },
  { key: "fileName", header: "File Name" },
  { key: "versionNo", header: "Version" },
  { key: "uploadedDateUtc", header: "Uploaded", render: (row) => new Date(row.uploadedDateUtc).toLocaleString() }
];

const relatedColumns: TableColumn<ClaimDetails["relatedClaims"][number]>[] = [
  { key: "claimId", header: "Claim ID" },
  { key: "claimNumber", header: "Claim Number" }
];

export function ClaimDetailPage() {
  const { id } = useParams();
  const claimId = Number(id);

  const [claim, setClaim] = useState<ClaimDetails | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [linking, setLinking] = useState(false);

  const [documentTypeId, setDocumentTypeId] = useState("1");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [relatedClaimId, setRelatedClaimId] = useState("");

  const load = useCallback(async () => {
    if (!Number.isFinite(claimId) || claimId <= 0) {
      setError("Invalid claim id.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await claimsApi.getById(claimId);
      setClaim(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load claim details.");
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onUploadDocument = async (event: FormEvent) => {
    event.preventDefault();
    if (!claim || !documentFile) {
      setMessage("Select a file before upload.");
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      await claimsApi.uploadDocument(claim.claimId, Number(documentTypeId), documentFile);
      setMessage("Document uploaded successfully.");
      setDocumentFile(null);
      await load();
    } catch (uploadError) {
      setMessage(uploadError instanceof Error ? uploadError.message : "Document upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onLinkRelatedClaim = async (event: FormEvent) => {
    event.preventDefault();
    if (!claim) {
      return;
    }

    const parsedRelatedClaimId = Number(relatedClaimId);
    if (!Number.isFinite(parsedRelatedClaimId) || parsedRelatedClaimId <= 0) {
      setMessage("Provide a valid related claim id.");
      return;
    }

    setLinking(true);
    setMessage(null);
    try {
      await claimsApi.linkRelatedClaim(claim.claimId, parsedRelatedClaimId);
      setRelatedClaimId("");
      setMessage("Related claim linked successfully.");
      await load();
    } catch (linkError) {
      setMessage(linkError instanceof Error ? linkError.message : "Unable to link related claim.");
    } finally {
      setLinking(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Claim Detail" subtitle="Intake, claimant, documents, and related claim links." />

      {loading ? <Alert severity="info">Loading claim details...</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {message ? <Alert severity="info">{message}</Alert> : null}

      {claim ? (
        <>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Claim Number
                  </Typography>
                  <Typography variant="h6">{claim.claimNumber}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Policy Number
                  </Typography>
                  <Typography variant="h6">{claim.policyNumber}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusChip status={claim.statusName} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Loss
                  </Typography>
                  <Typography variant="h6">${claim.estimatedLossAmount.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Incident Description
                  </Typography>
                  <Typography>{claim.incidentDescription || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location Of Loss
                  </Typography>
                  <Typography>{claim.locationOfLoss || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loss Date
                  </Typography>
                  <Typography>{new Date(claim.lossDateUtc).toLocaleDateString()}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Reported Date
                  </Typography>
                  <Typography>{new Date(claim.reportedDateUtc).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Claimant
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography>{claim.claimant?.fullName || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography>{claim.claimant?.contactNo || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{claim.claimant?.email || "-"}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography>
                    {claim.claimant?.addressLine || "-"}
                    {claim.claimant?.city ? `, ${claim.claimant.city}` : ""}
                    {claim.claimant?.state ? `, ${claim.claimant.state}` : ""}
                    {claim.claimant?.postalCode ? ` - ${claim.claimant.postalCode}` : ""}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: "grid", gap: 2 }}>
              <Typography variant="h6">Documents</Typography>
              <EntityTable
                columns={documentColumns}
                rows={claim.documents}
                rowKey={(row) => String(row.claimDocumentId)}
                emptyText="No documents uploaded."
              />
              <Stack component="form" direction={{ xs: "column", md: "row" }} spacing={1} onSubmit={onUploadDocument}>
                <TextField
                  label="Document Type Id"
                  type="number"
                  value={documentTypeId}
                  onChange={(event) => setDocumentTypeId(event.target.value)}
                  sx={{ width: { md: 180 } }}
                />
                <Button variant="outlined" component="label">
                  Select File
                  <input hidden type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                  {documentFile ? documentFile.name : "No file selected"}
                </Typography>
                <Button type="submit" variant="contained" disabled={uploading || !documentFile}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: "grid", gap: 2 }}>
              <Typography variant="h6">Related Claims</Typography>
              <EntityTable
                columns={relatedColumns}
                rows={claim.relatedClaims}
                rowKey={(row) => String(row.claimId)}
                emptyText="No related claims linked."
              />
              <Stack component="form" direction={{ xs: "column", md: "row" }} spacing={1} onSubmit={onLinkRelatedClaim}>
                <TextField
                  label="Related Claim Id"
                  type="number"
                  value={relatedClaimId}
                  onChange={(event) => setRelatedClaimId(event.target.value)}
                  sx={{ width: { md: 220 } }}
                />
                <Button type="submit" variant="contained" disabled={linking}>
                  {linking ? "Linking..." : "Link Claim"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </>
      ) : null}
    </PageContainer>
  );
}
