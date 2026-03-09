import { FormEvent, useState } from "react";
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { claimsApi } from "@/modules/claims/api/claimsApi";
import { PageContainer } from "@/core/components/PageContainer";
import { PageHeader } from "@/core/components/PageHeader";

interface IntakeFormState {
  policyNumber: string;
  claimTypeId: string;
  lossDateUtc: string;
  incidentDescription: string;
  locationOfLoss: string;
  estimatedLossAmount: string;
  claimantName: string;
  claimantContactNo: string;
  claimantEmail: string;
  claimantAddressLine: string;
  claimantCity: string;
  claimantState: string;
  claimantPostalCode: string;
  relatedClaimIds: string;
  documentTypeId: string;
}

const initialForm: IntakeFormState = {
  policyNumber: "",
  claimTypeId: "1",
  lossDateUtc: "",
  incidentDescription: "",
  locationOfLoss: "",
  estimatedLossAmount: "",
  claimantName: "",
  claimantContactNo: "",
  claimantEmail: "",
  claimantAddressLine: "",
  claimantCity: "",
  claimantState: "",
  claimantPostalCode: "",
  relatedClaimIds: "",
  documentTypeId: "1"
};

export function ClaimRegistrationPage() {
  const [form, setForm] = useState<IntakeFormState>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [createdClaimId, setCreatedClaimId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResponseMessage(null);
    setCreatedClaimId(null);

    try {
      const relatedClaimIds = form.relatedClaimIds
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value) && value > 0);

      const claim = await claimsApi.create({
        policyNumber: form.policyNumber.trim(),
        claimTypeId: Number(form.claimTypeId),
        lossDateUtc: new Date(form.lossDateUtc).toISOString(),
        incidentDescription: form.incidentDescription.trim(),
        locationOfLoss: form.locationOfLoss.trim(),
        estimatedLossAmount: Number(form.estimatedLossAmount),
        claimantName: form.claimantName.trim(),
        claimantContactNo: form.claimantContactNo.trim(),
        claimantEmail: form.claimantEmail.trim(),
        claimantAddressLine: form.claimantAddressLine.trim(),
        claimantCity: form.claimantCity.trim(),
        claimantState: form.claimantState.trim(),
        claimantPostalCode: form.claimantPostalCode.trim(),
        relatedClaimIds
      });

      if (files.length > 0) {
        const documentTypeId = Number(form.documentTypeId);
        await Promise.all(files.map((file) => claimsApi.uploadDocument(claim.claimId, documentTypeId, file)));
      }

      setCreatedClaimId(claim.claimId);
      setResponseMessage(`Claim ${claim.claimNumber} created successfully.`);
      setForm(initialForm);
      setFiles([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Claim creation failed.";
      setResponseMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Claim Intake (FNOL)"
        subtitle="Create claim, validate policy, capture incident/claimant details, and upload supporting documents."
      />
      <Card>
        <CardContent>
          <Stack component="form" onSubmit={onSubmit} spacing={2}>
            {responseMessage ? <Alert severity={createdClaimId ? "success" : "error"}>{responseMessage}</Alert> : null}
            {createdClaimId ? (
              <Button component={RouterLink} to={`/claims/${createdClaimId}`} variant="outlined">
                Open Claim Detail
              </Button>
            ) : null}

            <Typography variant="subtitle1">Claim & Incident</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Policy Number"
                  value={form.policyNumber}
                  onChange={(event) => setForm((prev) => ({ ...prev, policyNumber: event.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Claim Type Id"
                  type="number"
                  value={form.claimTypeId}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimTypeId: event.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Loss Date"
                  type="date"
                  value={form.lossDateUtc}
                  onChange={(event) => setForm((prev) => ({ ...prev, lossDateUtc: event.target.value }))}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Location Of Loss"
                  value={form.locationOfLoss}
                  onChange={(event) => setForm((prev) => ({ ...prev, locationOfLoss: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Estimated Loss Amount"
                  type="number"
                  value={form.estimatedLossAmount}
                  onChange={(event) => setForm((prev) => ({ ...prev, estimatedLossAmount: event.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Incident Description"
                  value={form.incidentDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, incidentDescription: event.target.value }))}
                  required
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Claimant Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Claimant Name"
                  value={form.claimantName}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantName: event.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Contact Number"
                  value={form.claimantContactNo}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantContactNo: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={form.claimantEmail}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantEmail: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Address"
                  value={form.claimantAddressLine}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantAddressLine: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="City"
                  value={form.claimantCity}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantCity: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="State"
                  value={form.claimantState}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantState: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Postal Code"
                  value={form.claimantPostalCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, claimantPostalCode: event.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Documents & Related Claims</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Related Claim IDs (comma separated)"
                  value={form.relatedClaimIds}
                  onChange={(event) => setForm((prev) => ({ ...prev, relatedClaimIds: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Document Type Id"
                  type="number"
                  value={form.documentTypeId}
                  onChange={(event) => setForm((prev) => ({ ...prev, documentTypeId: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button variant="outlined" component="label" fullWidth>
                  Select Documents
                  <input
                    hidden
                    type="file"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                  />
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  {files.length ? `${files.length} file(s) selected.` : "No files selected."}
                </Typography>
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create Claim"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
